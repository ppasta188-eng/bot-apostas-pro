import express from "express";
import { scanGames } from "../services/analysisService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await scanGames();
  res.json(data);
});

export default router;
