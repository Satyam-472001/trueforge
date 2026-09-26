import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { issues, repositories } from "../db/schema/index.js";

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

export const claimIssueForAgent = async (issueId) => {
  const [claimedIssue] = await db
    .update(issues)
    .set({
      agentStatus: "starting",
      agentError: null,
      agentStartedAt: new Date()
    })
    .where(and(
      eq(issues.id, issueId),
      or(isNull(issues.agentStatus), eq(issues.agentStatus, "failed"))
    ))
    .returning();

  return claimedIssue;
};

export const updateIssueAgentRun = async (issueId, values) => {
  const [updatedIssue] = await db
    .update(issues)
    .set(values)
    .where(eq(issues.id, issueId))
    .returning();

  return updatedIssue;
};

export const getIssueById = async (issueId) => {
  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, issueId))
    .limit(1);

  return issue;
};

export const getIssueRepositoryName = async (repositoryId) => {
  const [repository] = await db
    .select({ fullName: repositories.fullName })
    .from(repositories)
    .where(eq(repositories.id, repositoryId))
    .limit(1);

  return repository?.fullName;
};

export const getIssues = async ({ repositoryId, state, limit }) => {
  const filters = [];
  if (repositoryId) filters.push(eq(issues.repositoryId, repositoryId));
  if (state) filters.push(eq(issues.state, state));

  let query = db.select().from(issues);
  if (filters.length) query = query.where(and(...filters));

  return query.orderBy(desc(issues.githubUpdatedAt)).limit(limit);
};