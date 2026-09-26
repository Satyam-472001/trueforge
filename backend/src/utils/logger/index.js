import ENV from "../../config/env.js";
import pino from "pino";
import { logFilePath } from "./stream.js";

const isDev = ENV.NODE_ENV === "development";

let baseLogger;

if (isDev) {
  // Console logging in development
  baseLogger = pino({
    level: process.env.LOG_LEVEL || "debug",
    timestamp: pino.stdTimeFunctions.isoTime,
  });
} else {
  // File logging in production
  baseLogger = pino({
    level: process.env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: "pino/file",
      options: {
        destination: logFilePath,
        mkdir: true,
      },
    },
  });
}

class Logger {
  constructor(module) {
    this.logger = baseLogger.child({ module });
  }

  info(msg, data = {}) {
    const logData =
      typeof data === "object" && data !== null
        ? data
        : { value: data };

    this.logger.info(logData, msg);
  }

  error(msg, data = {}) {
    const logData =
      typeof data === "object" && data !== null
        ? data
        : { value: data };

    this.logger.error(logData, msg);
  }

  warn(msg, data = {}) {
    const logData =
      typeof data === "object" && data !== null
        ? data
        : { value: data };

    this.logger.warn(logData, msg);
  }

  debug(msg, data = {}) {
    const logData =
      typeof data === "object" && data !== null
        ? data
        : { value: data };

    this.logger.debug(logData, msg);
  }
}

export default Logger;