import { sql } from "./client.js";
import Logger from "../utils/logger/index.js";
const logger = new Logger("Database");

export const connectDatabase =
  async () => {

    try {

      await sql`SELECT 1`;

      logger.info("Database connected");

    } catch (error) {

      logger.error("❌ Database connection failed", error);

      process.exit(1);
    }
  };