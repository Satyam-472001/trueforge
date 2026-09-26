// feedback.schema.js

import {
  pgTable,
  uuid,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const feedback =
  pgTable(
    "feedback",
    {
      id:
        uuid("id")
          .defaultRandom()
          .primaryKey(),

      findingId:
        uuid("finding_id")
          .notNull(),

      githubUser:
        text("github_user"),

      reaction:
        text("reaction"),

      meaning:
        text("meaning"),

      createdAt:
        timestamp(
          "created_at"
        ).defaultNow()
    }
  );