import express from "express";
import crypto from "node:crypto";
import ENV from "../config/env.js";
import {
  claimIssueForAgent,
  getIssueById,
  getIssueRepositoryName,
  getIssues,
  updateIssueAgentRun
} from "../github/issues.repository.js";
import {
  getIssueCodingAgentStatus,
  startIssueCodingAgent
} from "../agents/issueCoder.agent.js";

const router = express.Router();

router.post("/:issueId/agent", async (req, res) => {
  const authorization = req.get("authorization") || "";
  const suppliedToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!ENV.TRUEFORGE.TRIGGER_TOKEN) {
    return res.status(503).json({ error: "Manual issue-agent trigger is not configured" });
  }

  const expectedBuffer = Buffer.from(ENV.TRUEFORGE.TRIGGER_TOKEN);
  const suppliedBuffer = Buffer.from(suppliedToken);
  if (expectedBuffer.length !== suppliedBuffer.length
    || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!/^\d+$/.test(req.params.issueId)) {
    return res.status(400).json({ error: "issueId must be numeric" });
  }

  const issueId = Number(req.params.issueId);

  try {
    const issue = await getIssueById(issueId);
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    if (issue.state !== "open") {
      return res.status(409).json({ error: "Only open issues can be sent to the coding agent" });
    }

    const repositoryFullName = await getIssueRepositoryName(issue.repositoryId);
    if (!repositoryFullName) {
      return res.status(409).json({ error: "Repository is not available for this installation" });
    }

    const claimedIssue = await claimIssueForAgent(issueId);
    if (!claimedIssue) {
      return res.status(409).json({
        error: "Issue already has an active or completed coding-agent run",
        status: issue.agentStatus
      });
    }

    try {
      const run = await startIssueCodingAgent({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        htmlUrl: issue.htmlUrl,
        repositoryFullName
      });

      await updateIssueAgentRun(issueId, {
        agentSessionId: run.sessionId,
        agentTurnId: run.turnId,
        agentStatus: run.status,
        agentError: null
      });

      return res.status(202).json({
        issueId,
        status: run.status,
        sessionId: run.sessionId,
        turnId: run.turnId
      });
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      await updateIssueAgentRun(issueId, {
        agentStatus: "failed",
        agentError: message
      });
      return res.status(502).json({ error: "TrueForge could not start the coding run", detail: message });
    }
  } catch (error) {
    console.error("Failed to start issue coding agent:", error);
    return res.status(500).json({ error: "Unable to start issue coding agent" });
  }
});

router.get("/:issueId/agent", async (req, res) => {
  if (!/^\d+$/.test(req.params.issueId)) {
    return res.status(400).json({ error: "issueId must be numeric" });
  }

  try {
    const issue = await getIssueById(Number(req.params.issueId));
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    if (!issue.agentSessionId || !issue.agentTurnId) {
      return res.json({
        status: issue.agentStatus || "not_started",
        error: issue.agentError || null
      });
    }

    const state = await getIssueCodingAgentStatus(issue.agentSessionId, issue.agentTurnId);
    const status = state?.status || issue.agentStatus;
    const error = state?.message || state?.reason || issue.agentError;

    if (status !== issue.agentStatus || error !== issue.agentError) {
      await updateIssueAgentRun(issue.id, {
        agentStatus: status,
        agentError: error
      });
    }

    return res.json({
      status,
      error: error || null,
      sessionId: issue.agentSessionId,
      turnId: issue.agentTurnId,
      output: state?.output?.content || null
    });
  } catch (error) {
    console.error("Failed to fetch TrueForge issue-agent status:", error);
    return res.status(502).json({ error: "Unable to fetch issue-agent status" });
  }
});

router.get("/", async (req, res) => {
  const { repositoryId, state } = req.query;
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

  if (repositoryId && !/^\d+$/.test(repositoryId)) {
    return res.status(400).json({ error: "repositoryId must be a numeric GitHub repository ID" });
  }

  if (state && !["open", "closed"].includes(state)) {
    return res.status(400).json({ error: "state must be open or closed" });
  }

  try {
    const issues = await getIssues({
      repositoryId: repositoryId ? Number(repositoryId) : undefined,
      state,
      limit
    });
    return res.json({ issues });
  } catch (error) {
    console.error("Failed to fetch collected issues:", error);
    return res.status(500).json({ error: "Unable to fetch issues" });
  }
});

export default router;