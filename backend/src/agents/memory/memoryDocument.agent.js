import { callAI } from "../../config/openai.client.js";
import { jsonrepair }
  from "jsonrepair";

const EMPTY_MEMORY = {
  sections: []
};

export const generateMemoryDocument = async (
  input
) => {

  const {
    diff,
    prTitle,
    prDescription
  } = input;

  const safeDiff =
    diff.length > 15000
      ? diff.substring(0, 15000)
      : diff;



  const prompt = `
You are a senior software engineer responsible for preserving long-term repository engineering memory.

Your role is NOT:
- changelog generation
- release note writing
- tutorial writing
- architectural storytelling
- engineering philosophy discussion
- generic documentation writing

Your role IS:
- extracting durable engineering knowledge from a pull request
- preserving repository understanding
- documenting important system behavior and responsibilities
- compressing engineering context into dense technical memory

The generated memory should help:
- future engineers
- maintainers
- onboarding developers
- AI coding agents

understand the repository efficiently.

==================================================
VALID SECTIONS
==================================================

- API Changes
- Database Changes
- Architecture
- Breaking Changes
- Dependencies
- Configuration
- Bug Fixes
- General Notes

Only use sections that are clearly relevant.

==================================================
CORE OBJECTIVES
==================================================

Focus on:
- system behavior changes
- initialization flows
- important responsibilities
- runtime behavior
- architectural boundaries
- configuration behavior
- important constraints
- component interactions
- important assumptions visible in the diff

==================================================
IMPORTANT RULES
==================================================

- Only describe information directly visible in the diff
- Do NOT invent business logic
- Do NOT hallucinate architecture
- Do NOT speculate beyond reasonable evidence
- Do NOT explain obvious concepts
- Do NOT generate tutorial-style documentation
- Do NOT write release notes
- Do NOT generate generic maintainability commentary
- Do NOT discuss coding standards unless directly visible
- Do NOT discuss engineering culture
- Avoid generic architectural philosophy
- Avoid repetitive wording
- Avoid excessive section headings
- Avoid raw code walkthroughs
- Avoid line-by-line explanations
- Avoid essay-style writing
- Avoid introductory filler
- Prefer bullets over paragraphs
- Prefer dense technical memory over narrative writing
- Each bullet should contain one concrete repository fact
- Keep bullets factual and repository-grounded
- Optimize for scanning and retrieval
- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
- No trailing commas

==================================================
WRITING STYLE
==================================================

- Prefer dense engineering knowledge
- Prefer factual technical memory
- Prefer compact high-signal explanations
- Prefer structured technical bullets
- Write like internal repository memory
- Keep explanations grounded in observable code behavior
- Optimize for future retrieval by humans and coding agents
- Keep tone technical, calm, and concise

==================================================
GOOD MEMORY EXAMPLES
==================================================

GOOD:

{
  "sections": [
    {
      "title": "Configuration",
      "topics": [
        {
          "title": "Logger Initialization",
          "points": [
            "Added runtime validation for logFilePath",
            "Logger now fails early on invalid transport config",
            "Logger initialization required before usage"
          ]
        },
        {
          "title": "Transport Configuration",
          "points": [
            "Development and production transports separated",
            "Production file transport enabled conditionally"
          ]
        }
      ]
    }
  ]
}

GOOD:

{
  "sections": [
    {
      "title": "Architecture",
      "topics": [
        {
          "title": "Review Pipeline",
          "points": [
            "Added review classifier after extraction stage",
            "Separated extraction logic from deterministic rendering",
            "Structured review schema introduced before formatting"
          ]
        }
      ]
    }
  ]
}

BAD:
"This documentation explores improvements made to the logging architecture."

BAD:
"These changes improve maintainability and developer experience."

BAD:
"The repository follows strong architectural principles."

BAD:
Large narrative paragraphs explaining obvious behavior.

==================================================
JSON FORMAT
==================================================

{
  "sections": [
    {
      "title": "Configuration",
      "topics": [
        {
          "title": "Logger Initialization",
          "points": [
            "technical memory point",
            "technical memory point"
          ]
        }
      ]
    }
  ]
}

RULES:
- Prefer bullets over paragraphs
- Keep points short and dense
- Group related points under compact topics
- Each point should represent one durable engineering fact
- Avoid filler transitions
- Avoid generic explanations
- Avoid narrative prose
- Avoid unnecessary introductions

==================================================
PR TITLE
==================================================

${prTitle || "N/A"}

==================================================
PR DESCRIPTION
==================================================

${prDescription || "N/A"}

==================================================
PR DIFF
==================================================

${safeDiff}
`;


  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 1400
  };

  const data = await callAI(payload);

  const result =
    data.choices?.[0]?.message?.content || "";

  if (!result) {

    return EMPTY_MEMORY;
  }


  try {

  const cleaned = result
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const repaired =
    jsonrepair(cleaned);

  const parsed =
    JSON.parse(repaired);

  if (
    !parsed.sections ||
    !Array.isArray(parsed.sections)
  ) {
    return EMPTY_MEMORY;
  }

  return parsed;

} catch (error) {


  return EMPTY_MEMORY;
}
};