// findings.schema.js

import {
  pgTable,
  uuid,
  bigint,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const findings =
  pgTable(
    "findings",
    {
      id:
        uuid("id")
          .defaultRandom()
          .primaryKey(),

      pullRequestId:
        bigint(
          "pull_request_id",
          {
            mode: "number"
          }
        ).notNull(),

      githubCommentId:
        bigint(
          "github_comment_id",
          {
            mode: "number"
          }
        ),

      title:
        text("title")
          .notNull(),

      type:
        text("type"),

      severity:
        text("severity"),

      confidence:
        text("confidence"),

      file:
        text("file"),

      status:
        text("status")
          .default("open"),

      explanation:
        text("explanation"),

      suggestion:
        text("suggestion"),

      createdAt:
        timestamp(
          "created_at"
        ).defaultNow()
    }
  );