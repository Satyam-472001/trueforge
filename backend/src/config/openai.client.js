import axios from "axios";
import ENV from "./env.js";

const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

export const callAI = async (payload) => {
  try {
    const response = await axios.post(
      OPENAI_CHAT_COMPLETIONS_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ENV.OPENAI.API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("OpenAI API Error:", error.response.data);
      throw new Error(
        `OpenAI request failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }

    throw new Error(`OpenAI request failed: ${error.message}`);
  }
};