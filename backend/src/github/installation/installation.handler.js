import { extractInstallationRepoInfo, formatLogMessage, handleInstallationRepos } from "./installation.service.js";
import { writeInstallationLog } from "./installation.logger.js";

async function handleInstallationRepositoriesEvent(payload) {
  const eventInfo = await handleInstallationRepos(payload);

  if (!eventInfo) {
    writeInstallationLog("UNKNOWN EVENT RECEIVED");
    return;
  }

  writeInstallationLog(formatLogMessage(eventInfo));

  return eventInfo;
}

export { handleInstallationRepositoriesEvent };