import { callAI } from "../../config/openai.client.js";

export const updateSectionMemory = async (
  input
) => {

  const {
    sectionTitle,
    existingContent,
    newMemory
  } = input;

  const prompt = `
You are a senior software engineer responsible for maintaining long-term repository memory inside TZYLO.md.

You are updating ONE documentation section.

Your job:
- merge new repository memory into existing memory
- preserve important existing knowledge
- integrate new knowledge cleanly
- avoid duplication
- maintain dense engineering memory

==================================================
IMPORTANT RULES
==================================================

- Do NOT remove important existing knowledge
- Do NOT rewrite unrelated content
- Do NOT generate narrative paragraphs
- Do NOT generate tutorial-style explanations
- Do NOT generate architectural storytelling
- Do NOT append repetitive points
- Do NOT invent architecture or flows
- Do NOT speculate beyond visible evidence
- Prefer dense bullet memory
- Prefer compact technical wording
- Preserve markdown formatting
- Return ONLY updated markdown
- No code fences
- No explanations outside markdown

==================================================
OUTPUT STYLE
==================================================

Use this structure:

### <Topic>

- technical memory point
- technical memory point
- technical memory point

RULES:
- Keep points short and dense
- Each point should contain one durable engineering fact
- Merge similar points together
- Remove duplicate ideas
- Prefer retrieval-friendly formatting
- Avoid filler wording
- Avoid long prose

==================================================
SECTION NAME
==================================================

${sectionTitle}

==================================================
EXISTING SECTION CONTENT
==================================================

${existingContent || "(empty section)"}

==================================================
NEW ENGINEERING MEMORY
==================================================

${JSON.stringify(newMemory, null, 2)}

==================================================
TASK
==================================================

Update the section by integrating the new engineering memory into the existing memory.

Preserve:
- useful historical repository knowledge
- important technical facts
- compact engineering understanding

Avoid:
- duplicated bullets
- noisy accumulation
- repeated topics
- verbose explanations
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

    return existingContent;
  }

  return result.trim();
};