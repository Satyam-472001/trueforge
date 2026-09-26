import { callAI } from "../../config/openai.client.js";

export const generateRawReview = async (
  input
) => {
  const {
    diff,
    prTitle,
    prDescription,
    tzyloConfig
  } = input;

  const safeDiff =
    diff.length > 12000
      ? diff.substring(0, 12000)
      : diff;

  const configSection = tzyloConfig
    ? `
PROJECT CONTEXT:
The repository contains the following engineering conventions and architectural rules.

${JSON.stringify(tzyloConfig, null, 2)}
`
    : "";

  const prompt = `
You are a senior software engineer performing a pull request review.

Your role is NOT to produce final review comments.

Your role is to OBSERVE and EXTRACT engineering signals from the diff.

Focus on:
- Bugs
- Maintainability concerns
- Readability concerns
- Architecture observations
- Performance concerns
- Security concerns
- Dependency/configuration impacts

IMPORTANT RULES:
- Only mention issues visible in the diff
- Do NOT invent missing business logic
- Do NOT give generic best-practice advice
- Ignore trivial formatting/style comments
- Prefer concrete observations
- Repository conventions and architecture rules are important
- Surface meaningful engineering observations even if confidence is moderate
- Avoid speculative or imaginary issues
- Do NOT classify severity
- Do NOT filter aggressively
- Return plain markdown sections

${configSection}

PR TITLE:
${prTitle || "N/A"}

PR DESCRIPTION:
${prDescription || "N/A"}

OUTPUT FORMAT:

# Bugs
- observation

# Maintainability
- observation

# Readability
- observation

# Architecture
- observation

# Performance
- observation

# Security
- observation

# Dependencies
- observation

If a section has no findings, write:
- None

DIFF:
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
    max_tokens: 1200
  };

  const data = await callAI(payload);

  const result =
    data.choices?.[0]?.message?.content || "";

  if (!result) {

    return "";
  }


  return result.trim();
};