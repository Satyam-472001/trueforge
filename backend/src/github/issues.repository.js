import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { issues } from "../db/schema/index.js";

export const upsertIssue = async ({ issue, repositoryId, installationId }) => {
  const values = {
    id: issue.id,
    repositoryId,
    installationId,
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    author: issue.user?.login ?? null,
    htmlUrl: issue.html_url,
    labels: (issue.labels ?? []).map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color
    })),
    githubCreatedAt: issue.created_at ? new Date(issue.created_at) : null,
    githubUpdatedAt: issue.updated_at ? new Date(issue.updated_at) : null,
    githubClosedAt: issue.closed_at ? new Date(issue.closed_at) : null,
    collectedAt: new Date()
  };

  const [savedIssue] = await db
    .insert(issues)
    .values(values)
    .onConflictDoUpdate({
      target: issues.id,
      set: values
    })
    .returning();

  return savedIssue;
};

export const removeIssue = async (issueId) => {
  await db.delete(issues).where(eq(issues.id, issueId));
};

export const getIssues = async ({ repositoryId, state, limit }) => {
  const filters = [];
  if (repositoryId) filters.push(eq(issues.repositoryId, repositoryId));
  if (state) filters.push(eq(issues.state, state));

  let query = db.select().from(issues);
  if (filters.length) query = query.where(and(...filters));

  return query.orderBy(desc(issues.githubUpdatedAt)).limit(limit);
};