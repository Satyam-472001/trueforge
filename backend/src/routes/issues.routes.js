import express from "express";
import { getIssues } from "../github/issues.repository.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { repositoryId, state } = req.query;
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

  if (repositoryId && !/^\d+$/.test(repositoryId)) {
    return res.status(400).json({ error: "repositoryId must be a numeric GitHub repository ID" });
  }

  if (state && !["open", "closed"].includes(state)) {
    return res.status(400).json({ error: "state must be open or closed" });
  }

  try {
    const issues = await getIssues({
      repositoryId: repositoryId ? Number(repositoryId) : undefined,
      state,
      limit
    });
    return res.json({ issues });
  } catch (error) {
    console.error("Failed to fetch collected issues:", error);
    return res.status(500).json({ error: "Unable to fetch issues" });
  }
});

export default router;