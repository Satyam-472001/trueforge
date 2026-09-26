import Logger from "../utils/logger/index.js";
const logger = new Logger("writer.agent.js");

import { callAI } from "../config/openai.client.js";

export const writerAgent = async ({ existingContent, newPoints }) => {
  logger.debug("Writer agent called", {
    existingContent,
    newPoints,
  });

  const hasExisting =
    existingContent && existingContent.trim().length > 0;

  const prompt = `
You are a technical documentation writer for an engineering team.

${hasExisting ? `Current documentation:\n${existingContent}\n` : ""}

New information from recent PR:
${newPoints.map((p) => `- ${p}`).join("\n")}

Your job:
- Merge current documentation with new information
- Write documentation as if the system already works this way
- Remove duplicate or outdated points
- Never mention PRs, commits, or timelines
- Never say "recently added" or "this PR"
- Keep documentation concise and factual
- Return ONLY bullet points
- No markdown code blocks
- No explanations
- No headers

STRICT FACTUALITY RULES:
- ONLY use information explicitly present in:
  1. current documentation
  2. new information from the PR
- NEVER invent architecture, libraries, features, security practices, or implementation details
- NEVER assume common authentication patterns
- If something is not explicitly mentioned, do not write it
- Do not expand beyond the provided context

Example input:
- Added auth routes
- Created authService

Example output:
- Authentication routes are defined in auth.routes.js.
- Authentication business logic is separated into authService.
`;

  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 800,
  };

  const data = await callAI(payload);

  let content =
    data?.choices?.[0]?.message?.content || "";

  content = content.replace(/```|```markdown/g, "").trim();

  logger.debug("Writer AI response", { content });

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, ""));

  return lines;
};