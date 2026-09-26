import { reviewService } from "./review.service.js";

export const reviewPR = async (req, res) => {
  try {
    const { prUrl } = req.body;

    const result = await reviewService(prUrl);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};