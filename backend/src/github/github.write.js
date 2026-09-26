// github.write.js

import axios from "axios";

import Logger
  from "../utils/logger/index.js";
import { getInstallationToken } from "./github.service.js";


const logger =
  new Logger("github.write.js");

const GITHUB_API =
  "https://api.github.com";

const FILE_NAME =
  "TZYLO.md";

// =============================
// Default TZYLO.md template
// =============================

const getEmptyDoc = () => `
# Tzylo Documentation

> Auto-generated engineering memory.
> Maintained by Tzylo Synapse.

---

## 🔌 API Changes
<!-- TZYLO:API_START -->
<!-- TZYLO:API_END -->

---

## 🗄️ Database Changes
<!-- TZYLO:DB_START -->
<!-- TZYLO:DB_END -->

---

## 🧱 Architecture
<!-- TZYLO:ARCH_START -->
<!-- TZYLO:ARCH_END -->

---

## ⚠️ Breaking Changes
<!-- TZYLO:BREAK_START -->
<!-- TZYLO:BREAK_END -->

---

## 📦 Dependencies
<!-- TZYLO:DEP_START -->
<!-- TZYLO:DEP_END -->

---

## ⚙️ Configuration
<!-- TZYLO:CONF_START -->
<!-- TZYLO:CONF_END -->

---

## 🐛 Bug Fixes
<!-- TZYLO:FIX_START -->
<!-- TZYLO:FIX_END -->

---

## 📝 General Notes
<!-- TZYLO:GEN_START -->
<!-- TZYLO:GEN_END -->
`;

// =============================
// Parse owner/repo from PR URL
// =============================

const parsePRUrl = (
  prApiUrl
) => {

  const match =
    prApiUrl.match(
      /repos\/([^/]+)\/([^/]+)\/pulls\/(\d+)/
    );

  if (!match) {
    throw new Error(
      "Invalid PR URL"
    );
  }

  const [
    ,
    owner,
    repo,
    prNumber
  ] = match;

  return {
    owner,
    repo,
    prNumber
  };
};

// =============================
// Fetch TZYLO.md
// =============================

export const getTzyloDocumentation =
  async ({
    prApiUrl,
    installationId
  }) => {

    const {
      owner,
      repo
    } = parsePRUrl(
      prApiUrl
    );

    const token = await getInstallationToken(
      installationId
    );


    try {

      const response =
        await axios.get(
          `${GITHUB_API}/repos/${owner}/${repo}/contents/${FILE_NAME}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/vnd.github+json"
            }
          }
        );

      const content =
        Buffer.from(
          response.data.content,
          "base64"
        ).toString("utf8");

      logger.debug(
        "Fetched existing TZYLO.md"
      );

      return {
        content,
        sha: response.data.sha
      };

    } catch (error) {

      // File doesn't exist yet
      if (
        error.response?.status === 404
      ) {

        logger.warn(
          "TZYLO.md not found, creating new file"
        );

        return {
          content: getEmptyDoc(),
          sha: null
        };
      }

      logger.error(
        "Failed to fetch TZYLO.md",
        { error }
      );

      throw error;
    }
  };

// =============================
// Commit updated TZYLO.md
// =============================

export const commitTzyloDocumentation =
  async ({
    prApiUrl,
    installationId,
    content,
    sha,
    branch
  }) => {

    const {
      owner,
      repo,
      prNumber
    } = parsePRUrl(
      prApiUrl
    );

    const token = await getInstallationToken(
      installationId
    );

    const body = {
      message:
        `docs(tzylo): update from PR #${prNumber}`,

      content:
        Buffer
          .from(content)
          .toString("base64"),

      branch
    };

    if (sha) {
      body.sha = sha;
    }

    try {

      await axios.put(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${FILE_NAME}`,
        body,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/vnd.github+json"
          }
        }
      );

      logger.info(
        "Committed updated TZYLO.md"
      );

    } catch (error) {

      logger.error(
        "Failed to commit TZYLO.md",
        { error }
      );

      throw error;
    }
  };