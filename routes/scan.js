import express from "express";
import { analisarJogos } from "../services/analysisService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const dados = await analisarJogos();
    res.json(dados);
  } catch (error) {
    console.error("ERRO NA ROTA:", error.message);
    res.status(500).json({ erro: "Erro ao analisar jogos" });
  }
});

export default router;
