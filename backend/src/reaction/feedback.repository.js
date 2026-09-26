// feedback.repository.js

import { eq } from "drizzle-orm";

import { db } from "../db/index.js";

import {
  feedback
} from "../db/schema/index.js";

export const createFeedback =
  async (data) => {

    const result =
      await db
        .insert(feedback)
        .values({
          findingId:
            data.findingId,

          githubUser:
            data.githubUser,

          reaction:
            data.reaction,

          meaning:
            data.meaning
        })
        .returning();

    return result[0];
  };

export const getFeedbackByFindingId =
  async (
    findingId
  ) => {

    return db
      .select()
      .from(feedback)
      .where(
        eq(
          feedback.findingId,
          findingId
        )
      );
  };