import { writeInstallationLog } from "./installation.logger.js";
import {
  upsertInstallation,
  upsertRepositories
} from "./installation.repository.js";

function formatLogMessage(info) {
    const repoNames = info.repositories
        .map((repo) => repo.name)
        .join(", ");

    return `
    [${info.timestamp}]
    ACTION: installation_repositories.${info.action}
    INSTALLATION_ID: ${info.installationId}
    ACCOUNT: ${info.account}
    SENDER: ${info.sender}
    REPOSITORIES: ${repoNames}
    --------------------------------------------------
    `;
}

function extractInstallationRepoInfo(payload) {
  try {
    const action = payload.action;

    if (!["added", "removed"].includes(action)) {
      return null;
    }

    const repositories =
      action === "added"
        ? payload.repositories_added || []
        : payload.repositories_removed || [];

    return {
      action,
      installationId: payload.installation?.id,
      account: payload.installation?.account?.login,
      sender: payload.sender?.login,
      repositories: repositories.map((repo) => ({
        id: repo.id,
        name: repo.full_name || repo.name,
      })),
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    writeInstallationLog(`ERROR extracting payload: ${err.message}`);
    return null;
  }
}

export { extractInstallationRepoInfo, formatLogMessage };

export const handleInstallationRepos =
  async (payload) => {

    const info =
      extractInstallationRepoInfo(
        payload
      );

    if (!info) {
      return;
    }

    await upsertInstallation(
      info
    );

    await upsertRepositories(
      info.installationId,
      info.repositories
    );

    return info;
  };
