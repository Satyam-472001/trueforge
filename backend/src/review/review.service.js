import ENV from "../config/env.js";
import { fetchPRDiff, fetchTzyloConfig } from "../github/github.service.js";
import { createFinding } from "./findings.repository.js";
import { generateRawReview } from "../agents/review/rawReviewer.agent.js";
import { classifyReview } from "../agents/review/reviewClassifier.agent.js";
import { postPRComment } from "../github/github.comment.js";
import { formatReviewComments } from "./comment.formatter.js";
import { cachePROutput } from "../utils/cache.js";
import Logger from "../utils/logger/index.js";

const logger = new Logger("ReviewService");

export const reviewService = async ({
  prApiUrl,
  installationId,
  prTitle,
  prDescription,
  pullRequestId
}) => {
  if (!ENV.ENABLE_PR_REVIEW) {
    logger.info("PR review pipeline is disabled via ENABLE_PR_REVIEW flag. Skipping review.");
    return { skipped: true, reason: "PR review pipeline is disabled via ENABLE_PR_REVIEW flag" };
  }

  logger.debug("PR API URL:", {
    prApiUrl
  });

  const diff = await fetchPRDiff(
    prApiUrl,
    installationId
  );

  logger.debug("Fetched PR diff");

  let tzyloConfig = null;

  try {
    tzyloConfig =
      await fetchTzyloConfig(
        prApiUrl,
        installationId
      );

    logger.debug(
      "Loaded tzylo.config.json",
      { tzyloConfig }
    );

  } catch (error) {

    logger.warn(
      "Could not fetch tzylo.config.json"
    );
  }

  // =========================
  // AGENT 1
  // Raw signal extraction
  // =========================

  const rawReview =
    await generateRawReview({
      diff,
      prTitle,
      prDescription,
      tzyloConfig
    });

  logger.debug("Raw review generated");

  // =========================
  // AGENT 2
  // Structured classification
  // =========================

  const structuredReview =
    await classifyReview(diff,
      prTitle,
      prDescription,rawReview);

  logger.debug(
    "Structured review generated",
    { structuredReview }
  );

  // =========================
  // Deterministic rendering
  // =========================

  const {
  summaryComment,
  findings
} =
  formatReviewComments(
    structuredReview
  );

logger.debug(
  "Formatted comments"
);

// Summary
await postPRComment(
  prApiUrl,
  summaryComment,
  installationId
);

// Individual findings
for (
  const finding 
  of findings
) {

  const {
    issue,
    comment
  } = finding;

  const createdComment  =
    await postPRComment(
    prApiUrl,
    comment,
    installationId
  );

  await createFinding({
    pullRequestId:
      pullRequestId,

    githubCommentId:
      createdComment.id,

    title:
      issue.title,

    type:
      issue.type,

    severity:
      issue.severity,

    confidence:
      issue.confidence,

    file:
      issue.file,

    explanation:
      issue.explanation,

    suggestion:
      issue.suggestion,

    status: "open"
  });


}

  cachePROutput(
    prApiUrl,
    structuredReview
  );

  return structuredReview;
};