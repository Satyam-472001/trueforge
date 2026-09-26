import { callAI } from "../../config/openai.client.js";


export const classifyReview = async (
  diff,
      prTitle,
      prDescription,
  rawReview
) => {

  const safeDiff =
    diff.length > 12000
      ? diff.substring(0, 12000)
      : diff;

  const prompt = `
You are a senior staff engineer performing a second-pass pull request review.

You are reviewing BOTH:
1. The original pull request diff
2. A raw engineering review generated from that diff

Your role is NOT to generate new findings from scratch.

Your role is to:
- verify the extracted observations against the actual code diff
- refine valid concerns into high-quality developer feedback
- remove weak, generic, noisy, repetitive, or unsupported observations
- classify severity and confidence carefully
- produce calm, developer-friendly review output

You act as a verification and refinement layer between:
- raw AI extraction
- final developer-facing review

==================================================
PRIMARY RESPONSIBILITIES
==================================================

- Cross-check observations against the actual diff
- Reject unsupported or speculative findings
- Preserve meaningful engineering concerns
- Remove duplicate observations
- Improve clarity and readability
- Explain WHY a concern matters
- Prioritize developer trust over quantity

==================================================
IMPORTANT REVIEW RULES
==================================================

- Do NOT invent new issues not present in RAW REVIEW
- Do NOT generate observations unrelated to the diff
- Only refine or reject existing findings
- Prefer precision over quantity
- Avoid speculative reasoning
- Ignore generic best-practice advice
- Ignore weak observations with low engineering value
- Ignore observations without visible supporting evidence
- Avoid robotic or overly authoritative language
- Keep findings concise but informative
- Optimize for developer readability and trust

==================================================
VALIDATION RULES
==================================================

You are allowed to:
- downgrade severity
- downgrade confidence
- completely remove observations
- merge duplicate findings

You are NOT allowed to:
- invent additional concerns
- assume missing business logic
- speculate about unseen code

==================================================
WRITING STYLE
==================================================

- Write like a thoughtful senior engineer
- Be calm, direct, and empathetic
- Make findings easy to scan
- Keep titles concise and skimmable
- explanation should clearly explain:
  - what the concern is
  - why it matters
  - where the risk comes from
- impact should describe:
  - runtime impact
  - maintenance burden
  - future engineering risk
- suggestion should be:
  - actionable
  - concise
  - realistic

==================================================
ISSUE TYPE RULES
==================================================

- bug → runtime or logic issue
- maintainability → difficult to maintain or extend
- readability → difficult to understand
- architecture → structural or design concern
- performance → inefficiency or scalability concern
- security → validation, auth, exposure, or security concern
- dependency → dependency or configuration concern

==================================================
SEVERITY RULES
==================================================

- high
  production risk, major bug, security issue

- medium
  meaningful maintainability, architecture, or moderate-risk concern

- low
  readability, clarity, or low-impact concern

==================================================
CONFIDENCE RULES
==================================================

- high
  directly visible in the diff

- medium
  supported by reasonable evidence

- low
  weak but potentially useful signal

==================================================
JSON FORMAT
==================================================

{
  "summary": "one concise sentence summarizing the review",

  "issues": [
    {
      "type": "bug | maintainability | readability | architecture | performance | security | dependency",

      "severity": "low | medium | high",

      "confidence": "low | medium | high",

      "file": "optional filename",

      "title": "short skimmable issue title",

      "explanation": "clear human-readable explanation of the concern and why it matters",

      "impact": "optional future engineering or runtime impact",

      "suggestion": "optional actionable suggestion"
    }
  ],

  "metrics": {
    "high": 0,
    "medium": 0,
    "low": 0
  }
}

==================================================
PR TITLE
==================================================

${prTitle || "N/A"}

==================================================
PR DESCRIPTION
==================================================

${prDescription || "N/A"}

==================================================
RAW REVIEW
==================================================

${rawReview}

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
    max_tokens: 1500
  };

  const data = await callAI(payload);

  const result =
    data.choices?.[0]?.message?.content || "";

  if (!result) {

    logAgentStep(
      "reviewClassifierAgent",
      "EMPTY_RESPONSE",
      data
    );

    return EMPTY_REVIEW;
  }

  try {

    const cleaned = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed =
      JSON.parse(cleaned);

    parsed.metrics = {
      high: parsed.issues.filter(
        issue => issue.severity === "high"
      ).length,

      medium: parsed.issues.filter(
        issue => issue.severity === "medium"
      ).length,

      low: parsed.issues.filter(
        issue => issue.severity === "low"
      ).length
    };

    return parsed;

  } catch (error) {

    return EMPTY_REVIEW;
  }
};