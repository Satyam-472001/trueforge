import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "./client.js";

export const db = drizzle(sql);