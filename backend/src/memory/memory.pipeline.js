import {
  fetchPRDiff,
  fetchTzyloConfig
} from "../github/github.service.js";

import {
  getTzyloDocumentation,
  commitTzyloDocumentation
} from "../github/github.write.js";

import {
  generateMemoryDocument
} from "../agents/memory/memoryDocument.agent.js";

import {
  classifyMemorySections
} from "../agents/memory/sectionClassifier.agent.js";

import {
  updateSectionMemory
} from "../agents/memory/sectionUpdater.agent.js";

import {
  extractSection
} from "./sections/extractSection.js";

import {
  replaceSection
} from "./sections/replaceSection.js";

import aiServiceClient from "../config/aiService.client.js";
import Logger
  from "../utils/logger/index.js";

const logger =
  new Logger("MemoryPipeline");

export const memoryPipeline =
  async ({
    prApiUrl,
    installationId,
    prTitle,
    prDescription,
    branch,
    repositoryId
  }) => {

    // =====================
    // Fetch diff
    // =====================

    const diff =
      await fetchPRDiff(
        prApiUrl,
        installationId
      );

    // =====================
    // Fetch config
    // =====================

    let tzyloConfig = null;

    try {

      tzyloConfig =
        await fetchTzyloConfig(
          prApiUrl,
          installationId
        );

    } catch (error) {

      logger.warn(
        "Could not fetch tzylo.config.json"
      );
    }

    // =====================
    // Agent 1
    // Generate memory
    // =====================

    const memoryDocument = await generateMemoryDocument({ diff, prTitle, prDescription });
    memoryDocument.repositoryId = String(repositoryId);

    try {
      logger.info("Calling ai-service /memory/update...");
      const aiResponse = await aiServiceClient.post("/memory/update", {
        repositoryId: String(repositoryId),
        memory: memoryDocument
      });
      logger.info("AI service memory update successful:", aiResponse.data);
    } catch (error) {
      logger.error("Failed to update memory in AI service:", error?.response?.data || error.message);
    }

    const {
      content: tzyloMd,
      sha
    } =
      await getTzyloDocumentation({
        prApiUrl,
        installationId
      });

    let updatedDoc = tzyloMd;

    for (const section of memoryDocument.sections) {

      const existingSection =
        extractSection(
          updatedDoc,
          section.title
        );

      const updatedSection =
        await updateSectionMemory({
          sectionName: section.title,
          existingContent: existingSection,
          newMemory: section.topics
        });

      updatedDoc =
        replaceSection(
          updatedDoc,
          section.title,
          updatedSection
        );
    }

    // =====================
    // Commit final markdown
    // =====================

    await commitTzyloDocumentation({
      prApiUrl,
      installationId,
      content: updatedDoc,
      sha,
      branch
    });

    logger.info(
      "TZYLO.md updated"
    );
  };