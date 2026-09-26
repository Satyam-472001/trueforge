import axios from "axios";
import { getInstallationToken } from "./github.service.js";

export const postPRComment = async (prUrl, comment, installationId) => {
  const token = await getInstallationToken(installationId);

  const match = prUrl.match(/repos\/([^/]+)\/([^/]+)\/pulls\/(\d+)/);

  if (!match) throw new Error("Invalid PR URL");

  const [, owner, repo, prNumber] = match;

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

  console.log("url:", url);

  const response = await axios.post(
  url,
  { body: comment },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  }
);

  return response.data;
};