import express from "express";
import ENV from "./config/env.js";
import { connectDatabase } from "./db/connect.js";

import Logger from "./utils/logger/index.js";
const logger = new Logger("APP");

import reviewRoutes from "./routes/review.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import issuesRoutes from "./routes/issues.routes.js";

const app = express();

app.use("/api/webhook", webhookRoutes);

app.use(express.json());

await connectDatabase();
app.use("/api/review", reviewRoutes);
app.use("/api/issues", issuesRoutes);

app.get("/", (req, res) => {
  res.send("Sentra is running 🚀");
});

app.listen(ENV.PORT, () => {
  logger.info(`Server running on port http://localhost:${ENV.PORT}`);
});