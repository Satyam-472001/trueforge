import express from "express";
import crypto from "crypto";
import ENV from "../config/env.js";
import { reviewService } from "../review/review.service.js";
import { memoryPipeline } from "../memory/memory.pipeline.js";
import { createPullRequest } from "../github/pullRequest/pullRequest.repository.js";
import {  getCachedPRComment, cachePRComment } from "../utils/cache.js";
import {
  handleReactionFeedback,
  collectPRFeedback
} from "../reaction/feedback.service.js";

import { handleInstallationRepositoriesEvent } from "../github/installation/installation.handler.js";
import { removeIssue, upsertIssue } from "../github/issues.repository.js";
import Logger from "../utils/logger/index.js";
const logger = new Logger("webhook");

const router = express.Router();

router.post(
  "/github",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-hub-signature-256"];
      const secret = process.env.GITHUB_WEBHOOK_SECRET;

      const hmac = crypto.createHmac("sha256", secret);
      const digest = "sha256=" + hmac.update(req.body).digest("hex");

      if (signature !== digest) {
        return res.status(401).send("Invalid signature");
      }

      const payload = JSON.parse(req.body.toString());
      const event = req.headers["x-github-event"];

      if (event === "installation_repositories") {
        logger.debug("Installation repositories event received");
        await handleInstallationRepositoriesEvent(payload);
      }

      if (event === "issues") {
        const issue = payload.issue;
        const repositoryId = payload.repository?.id;
        const installationId = payload.installation?.id;

        if (issue && repositoryId && !issue.pull_request) {
          if (payload.action === "deleted") {
            await removeIssue(issue.id);
          } else {
            await upsertIssue({ issue, repositoryId, installationId });
          }
        }
      }

      if (event === "reaction") {
        logger.debug("Reaction event received");
        await handleReactionFeedback(payload);
      }

      if (event === "pull_request") {
        const action = payload.action;

        let result;

        if (["opened", "synchronize"].includes(action)) {
          const pr = payload.pull_request;

          const prUrl = pr.html_url;
          const repo = payload.repository.full_name;
          const prNumber = pr.number;
          const installationId = payload.installation.id;
          const prApiUrl = pr.url;
          const prTitle = pr.title;
          const prDescription = pr.body;
          const pullRequestId = payload.pull_request.id;
          const repoId = payload.repository.id;

          logger.info("Processing PR:", prUrl);

          if(action === "opened") {
              await createPullRequest({
                githubPrId: pullRequestId,
                repositoryId: repoId,
                prNumber: prNumber,
                title: prTitle,
                author: pr.user.login
              });
          }

          if (!ENV.ENABLE_PR_REVIEW) {
            logger.info("PR review pipeline is disabled via ENABLE_PR_REVIEW flag. Skipping review.");
          } else {
            result = await reviewService({prApiUrl, installationId, prTitle, prDescription, pullRequestId});
            logger.info("Comment posted");
          }
        }
      

      if (action === "closed" && payload.pull_request.merged) {

        const pr = payload.pull_request;
        const prApiUrl = pr.url;
        const installationId = payload.installation.id;
        const branch = payload.pull_request.base.ref;
        const prTitle = pr.title;
        const prDescription = pr.body;
        const repositoryId = payload.repository.id;

        await memoryPipeline({
          prApiUrl,
          installationId,
          prTitle,
          prDescription,
          branch,
          repositoryId
        });

        logger.info("TZYLO.md updated");

        await collectPRFeedback({
          prApiUrl,
          pullRequestId: pr.id,
          installationId
        });
      }
    }

    if (event === "issue_comment") {
  const prApiUrl = payload.issue.pull_request?.url;

  logger.debug("PR URL:", prApiUrl);
  
  if (!prApiUrl) {
    return res.status(200).json({ success: true });
  }

  const comment = {
    user: payload.comment.user.login,
    body: payload.comment.body,
    createdAt: payload.comment.created_at,
  };

  logger.debug("Comment:", comment);

  const existing = getCachedPRComment(prApiUrl) || [];

  logger.debug("Existing:", existing);

  existing.push(comment);

  cachePRComment(prApiUrl, existing);

  logger.info("PR conversation cached ✅");
}

      res.status(200).json({ success: true });
    } catch (err) {
      logger.error("Webhook error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;