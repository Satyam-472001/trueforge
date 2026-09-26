import { callAI } from "../../config/openai.client.js";

const VALID_SECTIONS = [
  "API Changes",
  "Database Changes",
  "Architecture",
  "Breaking Changes",
  "Dependencies",
  "Configuration",
  "Bug Fixes",
  "General Notes"
];

export const classifyMemorySections = async (
  memoryDocument
) => {


  const prompt = `
You are responsible for classifying engineering memory into repository documentation sections.

You are given generated engineering documentation.

Your task:
- determine which documentation sections should be updated
- choose ONLY relevant sections
- avoid over-classification

IMPORTANT RULES:
- Only use provided section names
- Return as few sections as necessary
- Prefer precision over quantity
- Do NOT invent new sections
- Do NOT explain reasoning
- Return ONLY valid JSON
- No markdown
- No trailing commas

VALID SECTIONS:
- API Changes
- Database Changes
- Architecture
- Breaking Changes
- Dependencies
- Configuration
- Bug Fixes
- General Notes

SECTION GUIDELINES:

- API Changes
  API contracts, routes, payloads, response structures

- Database Changes
  schema updates, models, persistence changes

- Architecture
  system design, responsibilities, workflows, service boundaries

- Breaking Changes
  incompatible behavior or migration-impacting changes

- Dependencies
  libraries, packages, infrastructure integrations

- Configuration
  environment variables, runtime setup, transports, configs

- Bug Fixes
  fixes for incorrect runtime behavior

- General Notes
  engineering knowledge not fitting other sections

JSON FORMAT:

{
  "sections": [
    "Architecture",
    "Configuration"
  ]
}

ENGINEERING MEMORY:

${memoryDocument}
`;


  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 300
  };

  const data = await callAI(payload);

  const result =
    data.choices?.[0]?.message?.content || "";

  if (!result) {

    return {
      sections: ["General Notes"]
    };
  }

  try {

    const cleaned = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed =
      JSON.parse(cleaned);

    const filteredSections =
      parsed.sections.filter(section =>
        VALID_SECTIONS.includes(section)
      );

    return {
      sections:
        filteredSections.length > 0
          ? filteredSections
          : ["General Notes"]
    };

  } catch (error) {

    return {
      sections: ["General Notes"]
    };
  }
};``