// feedback.service.js

import {
  getFindingByCommentId,
  getFindingsByPullRequestId
} from "../review/findings.repository.js";

import {
  createFeedback,
  getFeedbackByFindingId
} from "./feedback.repository.js";

import {
  reactionMeaningMap
} from "./reaction.mapper.js";

import {
  fetchCommentReactions
} from "../github/github.service.js";

import Logger from "../utils/logger/index.js";

const logger = new Logger("FeedbackService");

export const handleReactionFeedback =
  async (payload) => {

    try {

      const reaction =
        payload.reaction;

      const comment =
        payload.comment;

      // Ignore non-bot comments
      if (
        comment.user.login !==
        "tzylo[bot]" && comment.user.type !== "tzylo-synapse[bot]"
      ) {
        return;
      }

      const finding =
        await getFindingByCommentId(
          comment.id
        );

      if (!finding) {
        return;
      }

      const meaning =
        reactionMeaningMap[
          reaction.content
        ];

      if (!meaning) {
        return;
      }

      const savedFeedback =
        await createFeedback({
          findingId:
            finding.id,

          githubUser:
            payload.sender.login,

          reaction:
            reaction.content,

          meaning
        });

      console.log(
        "✅ Feedback saved",
        savedFeedback.id
      );

      return savedFeedback;

    } catch (error) {

      console.error(
        "❌ Failed to save feedback",
        error
      );
    }
  };

export const collectPRFeedback = async ({
  prApiUrl,
  pullRequestId,
  installationId
}) => {
  try {
    const prFindings = await getFindingsByPullRequestId(pullRequestId);
    logger.info(`Collecting feedback for PR ${pullRequestId}. Found ${prFindings.length} findings.`);

    for (const finding of prFindings) {
      if (!finding.githubCommentId) continue;

      try {
        const reactions = await fetchCommentReactions(
          prApiUrl,
          finding.githubCommentId,
          installationId
        );

        for (const rx of reactions) {
          const meaning = reactionMeaningMap[rx.content];
          if (!meaning) continue;

          const existing = await getFeedbackByFindingId(finding.id);
          const exists = existing.some(
            (f) => f.githubUser === rx.user.login && f.reaction === rx.content
          );

          if (!exists) {
            await createFeedback({
              findingId: finding.id,
              githubUser: rx.user.login,
              reaction: rx.content,
              meaning
            });
            logger.info(`Saved feedback for finding ${finding.id} from ${rx.user.login}: ${rx.content} (${meaning})`);
          }
        }
      } catch (err) {
        logger.error(`Failed to fetch/save reactions for comment ${finding.githubCommentId}:`, err);
      }
    }
  } catch (error) {
    logger.error("Error collecting PR feedback:", error);
  }
};