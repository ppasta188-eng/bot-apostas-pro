import express from "express";
import { scanGames } from "./rotas/scan.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

app.get("/scan", async (req, res) => {
  try {
    const dados = await scanGames();
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro no scanner" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
