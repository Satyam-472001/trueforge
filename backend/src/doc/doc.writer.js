import {
  getInstallationToken
} from "../github/github.service.js";

import {
  updateTzyloDocumentation
} from "../github/github.write.js";

import {
  extractSection
} from "./sections/extractSection.js";

import {
  replaceSection
} from "./sections/replaceSection.js";

import {
  updateSectionMemory
} from "./agents/sectionUpdater.agent.js";

const SECTION_ALIASES = {

  // API Changes
  "api changes": "API Changes",
  "api": "API Changes",
  "endpoints": "API Changes",
  "rest api": "API Changes",

  // Database Changes
  "database changes": "Database Changes",
  "database": "Database Changes",
  "db": "Database Changes",
  "migrations": "Database Changes",
  "schema": "Database Changes",

  // Architecture
  "architecture": "Architecture",
  "arch": "Architecture",
  "refactor": "Architecture",
  "refactors": "Architecture",
  "structure": "Architecture",

  // Breaking Changes
  "breaking changes": "Breaking Changes",
  "breaking": "Breaking Changes",
  "breaking change": "Breaking Changes",

  // Dependencies
  "dependencies": "Dependencies",
  "deps": "Dependencies",
  "packages": "Dependencies",
  "setup": "Dependencies",

  // Configuration
  "configuration": "Configuration",
  "config": "Configuration",
  "environment variables": "Configuration",
  "env vars": "Configuration",
  "env": "Configuration",

  // Bug Fixes
  "bug fixes": "Bug Fixes",
  "bug fix": "Bug Fixes",
  "fixes": "Bug Fixes",
  "fix": "Bug Fixes",

  // General Notes
  "general notes": "General Notes",
  "general": "General Notes",
  "notes": "General Notes",
  "other": "General Notes",
};

export function normalizeSection(title) {

  const key =
    title.toLowerCase().trim();

  return (
    SECTION_ALIASES[key] ||
    "General Notes"
  );
}

export async function docsWriter({
  prApiUrl,
  installationId,
  sections,
  memoryDocument,
  branch
}) {

  const token =
    await getInstallationToken(
      installationId
    );

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

  // =========================
  // Normalize sections
  // =========================

  const normalizedSections =
    sections.map(section =>
      normalizeSection(section)
    );

  // =========================
  // Fetch current TZYLO.md
  // =========================

  let tzyloMd =
    await updateTzyloDocumentation({
      owner,
      repo,
      prNumber,
      token,
      branch,
      mode: "read"
    });

  // =========================
  // Update sections
  // =========================

  for (const section of normalizedSections) {

    const existingSection =
      extractSection(
        tzyloMd,
        section
      );

    const updatedSection =
      await updateSectionMemory({
        sectionName: section,
        existingContent:
          existingSection,
        newMemory:
          memoryDocument
      });

    tzyloMd =
      replaceSection(
        tzyloMd,
        section,
        updatedSection
      );
  }

  // =========================
  // Persist updated TZYLO.md
  // =========================

  await updateTzyloDocumentation({
    owner,
    repo,
    prNumber,
    token,
    branch,
    content: tzyloMd,
    mode: "write"
  });

  return {
    success: true,
    sections:
      normalizedSections
  };
}