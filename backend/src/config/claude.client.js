import axios from "axios";
import ENV from "./env";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export const callClaude = async (payload) => {
  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      payload,
      {
        headers: {
          "x-api-key": ENV.CLAUDE.API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        timeout: 15000, // prevent hanging
      }
    );

    return response.data;

  } catch (error) {
    // 🔥 useful debugging
    if (error.response) {
      console.error("Claude API Error:", error.response.data);
      throw new Error(
        `Claude API failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }

    if (error.request) {
      console.error("No response from Claude:", error.request);
      throw new Error("Claude API not responding");
    }

    console.error("Claude Setup Error:", error.message);
    throw new Error("Claude request setup failed");
  }
};