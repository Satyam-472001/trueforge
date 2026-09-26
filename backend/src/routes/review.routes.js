import express from "express";
import { reviewPR } from "../review/review.controller.js";

const router = express.Router();

router.post("/", reviewPR);

export default router;