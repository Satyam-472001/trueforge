import axios from "axios";
import generateJWT from "./github.jwt.js";
import Logger from "../utils/logger/index.js";

const logger = new Logger("GitHubService");

export const getInstallationToken = async (installationId) => {
  const jwtToken = generateJWT();

  const response = await axios.post(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  return response.data.token;
};

export const fetchPRDiff = async (prApiUrl, installationId) => {
  if (!prApiUrl.includes("github.com")) {
    throw new Error("Invalid PR URL");
  }

  const token = await getInstallationToken(installationId);

  const response = await axios.get(prApiUrl, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const fetchTzyloConfig = async (
  prApiUrl,
  installationId,
  defaultBranch = "main"
) => {
  try {
    const token = await getInstallationToken(installationId);

    const repoUrl = prApiUrl.split("/pulls/")[0];

    const configUrl =
      `${repoUrl}/contents/tzylo.config.json?ref=${defaultBranch}`;

    const response = await axios.get(configUrl, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (err) {
    logger.error(
      "[TZYLO CONFIG] No config found, using defaults", err
    );

    return {
      architecture_rules: [],
      coding_conventions: [],
      maintainability_rules: [],
    };
  }
};

export const fetchCommentReactions = async (
  prApiUrl,
  commentId,
  installationId
) => {
  const token = await getInstallationToken(installationId);
  const match = prApiUrl.match(/repos\/([^/]+)\/([^/]+)\/pulls\/(\d+)/);
  if (!match) {
    throw new Error("Invalid PR URL");
  }
  const [, owner, repo] = match;
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/comments/${commentId}/reactions`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  return response.data;
};