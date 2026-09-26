import {
  bigint,
  jsonb,
  pgTable,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const issues = pgTable("issues", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  repositoryId: bigint("repository_id", { mode: "number" }).notNull(),
  installationId: bigint("installation_id", { mode: "number" }),
  number: bigint("number", { mode: "number" }).notNull(),
  title: text("title").notNull(),
  body: text("body"),
  state: text("state").notNull(),
  author: text("author"),
  htmlUrl: text("html_url").notNull(),
  labels: jsonb("labels").notNull().default([]),
  githubCreatedAt: timestamp("github_created_at", { withTimezone: true }),
  githubUpdatedAt: timestamp("github_updated_at", { withTimezone: true }),
  githubClosedAt: timestamp("github_closed_at", { withTimezone: true }),
  agentSessionId: text("agent_session_id"),
  agentTurnId: text("agent_turn_id"),
  agentStatus: text("agent_status"),
  agentError: text("agent_error"),
  agentStartedAt: timestamp("agent_started_at", { withTimezone: true }),
  collectedAt: timestamp("collected_at", { withTimezone: true }).defaultNow().notNull()
});