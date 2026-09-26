import dotenv from "dotenv";

dotenv.config();

function requiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}`
    );
  }

  return value;
}

function optionalEnv(
  key,
  defaultValue
) {
  const value = process.env[key];

  return value !== undefined ? value : defaultValue;
}

function featureEnv(key) {
  const value = process.env[key];

  if (!value) {
    console.error(`[ENV] Feature variable missing: ${key}`);
    return null;
  }

  return value;
}

function featureEnabled(key) {
  return optionalEnv(key, "false") === "true";
}

const ENV = {
  AI_SERVICE: {
    URL: optionalEnv("AI_SERVICE_URL", "http://localhost:8000"),
  },

OPENAI: {
    API_KEY: requiredEnv("OPENAI_API_KEY"),
  },  

  DB: {
    URL: requiredEnv("DATABASE_URL"),
  },

  ENABLE_PR_REVIEW: featureEnabled("ENABLE_PR_REVIEW"),

  GITHUB: {
    APP_ID: requiredEnv("GITHUB_APP_ID"),
    PRIVATE_KEY_PATH: requiredEnv(
      "GITHUB_PRIVATE_KEY_PATH"
    ),
    WEBHOOK_SECRET: requiredEnv(
      "GITHUB_WEBHOOK_SECRET"
    ),
  },

  LOG_LEVEL: optionalEnv("LOG_LEVEL", "info"),

  NODE_ENV: optionalEnv(
    "NODE_ENV",
    "development"
  ),

  OPENAI: {
    API_KEY: requiredEnv("OPENAI_API_KEY"),
  },

  TRUEFORGE: {
    URL: optionalEnv("TRUEFORGE_URL", "http://localhost:8790"),
    TOKEN: optionalEnv("TRUEFORGE_TOKEN", ""),
    MODEL: optionalEnv("TRUEFORGE_MODEL", "openai/gpt-5-4-mini"),
    ISSUE_TRIGGER_LABEL: optionalEnv(
      "TRUEFORGE_ISSUE_TRIGGER_LABEL",
      "trueforge:implement"
    ),
  },

  PORT: optionalEnv("PORT", 7200),
};

export default ENV;