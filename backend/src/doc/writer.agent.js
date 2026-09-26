import { updateSectionMemory } from "../agents/memory/sectionUpdater.agent.js";

const SECTION_MARKERS = {
  "API Changes":           ["<!-- TZYLO:API_START -->",  "<!-- TZYLO:API_END -->"],
  "Database Changes":      ["<!-- TZYLO:DB_START -->",   "<!-- TZYLO:DB_END -->"],
  "Architecture":          ["<!-- TZYLO:ARCH_START -->", "<!-- TZYLO:ARCH_END -->"],
  "Breaking Changes":      ["<!-- TZYLO:BREAK_START -->","<!-- TZYLO:BREAK_END -->"],
  "Dependencies":          ["<!-- TZYLO:DEP_START -->",  "<!-- TZYLO:DEP_END -->"],
  "Configuration":         ["<!-- TZYLO:CONF_START -->", "<!-- TZYLO:CONF_END -->"],
  "Bug Fixes":             ["<!-- TZYLO:FIX_START -->",  "<!-- TZYLO:FIX_END -->"],
  "General Notes":         ["<!-- TZYLO:GEN_START -->",  "<!-- TZYLO:GEN_END -->"],
}

const formatContent = (points) => {
  if (!points || points.length === 0) return '';
  return '\n' + points.map(p => `- ${p}`).join('\n') + '\n';
};

export const extractSectionContent = (doc, startMarker, endMarker) => {
  const start = doc.indexOf(startMarker);
  const end = doc.indexOf(endMarker);

  if (start === -1 || end === -1) return '';

  const content = doc
    .substring(start + startMarker.length, end)
    .trim();

  return content;
};

const insertIntoSection = (doc, startMarker, endMarker, newContent) => {
  const startIndex = doc.indexOf(startMarker);
  const endIndex = doc.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Markers not found: ${startMarker}`);
  }

  const before = doc.slice(0, startIndex + startMarker.length);
  const after = doc.slice(endIndex);

  const existingContent = doc.slice(
    startIndex + startMarker.length,
    endIndex
  ).trim();

  const combinedContent = existingContent
    ? `${existingContent}\n${newContent}`
    : newContent;

  return `${before}\n${combinedContent}\n${after}`;
};

import { writerAgent } from "../agents/writer.agent.js";

export const updateTzyloDoc = async ({ existingDoc, sections, prNumber }) => {
  let updatedDoc = existingDoc;

  for (const section of sections) {
    const markers = SECTION_MARKERS[section.title];
    if (!markers) continue;

    const [startMarker, endMarker] = markers;

    // Extract existing content from this section
    const existingContent = extractSectionContent(
      existingDoc,
      startMarker,
      endMarker
    );

    // Run Writer Agent — merge existing + new
    const mergedPoints = await updateSectionMemory({
      sectionTitle: section.title,
      existingContent,
      newPoints: section.content
    });

    // Format and write back
    const formatted = formatContent(mergedPoints);

    updatedDoc = insertIntoSection(
      updatedDoc,
      startMarker,
      endMarker,
      formatted
    );
  }

  return updatedDoc;
};