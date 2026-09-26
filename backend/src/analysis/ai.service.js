import { callAI } from "../config/openai.client.js";
import { buildPrompt } from "./prompt.builder.js";

export const analyzeDiff = async (diff, prTitle, prDescription, tzyloConfig) => {
  const prompt = buildPrompt({ diff, prTitle, prDescription, tzyloConfig });

  const payload = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
  };

  const data = await callAI(payload);

  let content = data.choices?.[0]?.message?.content || "";

  content = content.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("JSON parse failed:", content);
    parsed = {
      review: { summary: content, issues: [] },
      documentation: { summary: "", changes: [] }
    };
  }

  return parsed;
};