import postgres from "postgres";
import ENV from "../config/env.js";

export const sql = postgres(ENV.DB.URL);