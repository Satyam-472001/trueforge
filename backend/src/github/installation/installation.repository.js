import { db } from "../../db/index.js";

import {
  installations,
  repositories
} from "../../db/schema/index.js";

export const upsertInstallation =
  async (data) => {

    await db
      .insert(installations)
      .values({
        id: data.installationId,
        accountLogin:
          data.account,
        senderLogin:
          data.sender
      })
      .onConflictDoNothing();
  };

export const upsertRepositories =
  async (
    installationId,
    repos
  ) => {

    for (const repo of repos) {

      const [
        owner,
        name
      ] = repo.name.split("/");

      await db
        .insert(repositories)
        .values({
          id: repo.id,
          installationId,
          fullName:
            repo.name,
          owner,
          name
        })
        .onConflictDoNothing();
    }
  };