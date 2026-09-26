import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {  findings } from "../db/schema/index.js";

export const createFinding =
  async (data) => {

    const result =
      await db
        .insert(findings)
        .values({
          pullRequestId:
            data.pullRequestId,

          githubCommentId:
            data.githubCommentId,

          title:
            data.title,

          type:
            data.type,

          severity:
            data.severity,

          confidence:
            data.confidence,

          file:
            data.file,

          status:
            data.status || "open",

          explanation:
            data.explanation,

          suggestion:
            data.suggestion
        })
        .returning();

    return result[0];
  };

export const updateFindingCommentId =
  async (
    findingId,
    githubCommentId
  ) => {

    const result =
      await db
        .update(findings)
        .set({
          githubCommentId
        })
        .where(
          eq(
            findings.id,
            findingId
          )
        )
        .returning();

    return result[0];
  };

export const updateFindingStatus =
  async (
    findingId,
    status
  ) => {

    const result =
      await db
        .update(findings)
        .set({
          status
        })
        .where(
          eq(
            findings.id,
            findingId
          )
        )
        .returning();

    return result[0];
  };

export const getFindingByCommentId =
  async (
    githubCommentId
  ) => {

    const result =
      await db
        .select()
        .from(findings)
        .where(
          eq(
            findings.githubCommentId,
            githubCommentId
          )
        );

    return result[0];
  };

export const getFindingsByPullRequestId =
  async (
    pullRequestId
  ) => {

    return db
      .select()
      .from(findings)
      .where(
        eq(
          findings.pullRequestId,
          pullRequestId
        )
      );
  };