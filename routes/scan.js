import express from "express";
import { scanGames } from "../services/analysisService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const jogos = await scanGames();
    res.json(jogos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar jogos" });
  }
});

export default router;
