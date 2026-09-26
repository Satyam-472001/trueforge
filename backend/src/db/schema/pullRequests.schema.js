// pullRequests.schema.js

import {
  pgTable,
  bigint,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const pullRequests =
  pgTable(
    "pull_requests",
    {
      id: bigint(
        "id",
        {
          mode: "number"
        }
      ).primaryKey(),

      repositoryId:
        bigint(
          "repository_id",
          {
            mode: "number"
          }
        ).notNull(),

      githubPrId:
        bigint(
          "github_pr_id",
          {
            mode: "number"
          }
        ).notNull(),

      prNumber:
        bigint(
          "pr_number",
          {
            mode: "number"
          }
        ).notNull(),

      title:
        text("title"),

      author:
        text("author"),

      riskLevel:
        text("risk_level"),

      summary:
        text("summary"),

      createdAt:
        timestamp(
          "created_at"
        ).defaultNow()
    }
  );