// pullRequests.repository.js

import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";

import {
  pullRequests
} from "../../db/schema/index.js";

export const createPullRequest =
  async (data) => {

    const result =
      await db
        .insert(pullRequests)
        .values({
          id: data.githubPrId,

          repositoryId:
            data.repositoryId,

          githubPrId:
            data.githubPrId,

          prNumber:
            data.prNumber,

          title:
            data.title,

          author:
            data.author,

          riskLevel:
            data.riskLevel,

          summary:
            data.summary
        })
        .onConflictDoNothing()
        .returning();

    return result[0];
  };

export const getPullRequestById =
  async (
    githubPrId
  ) => {

    const result =
      await db
        .select()
        .from(pullRequests)
        .where(
          eq(
            pullRequests.githubPrId,
            githubPrId
          )
        );

    return result[0];
  };

export const updatePullRequest =
  async (
    githubPrId,
    data
  ) => {

    const result =
      await db
        .update(pullRequests)
        .set(data)
        .where(
          eq(
            pullRequests.githubPrId,
            githubPrId
          )
        )
        .returning();

    return result[0];
  };