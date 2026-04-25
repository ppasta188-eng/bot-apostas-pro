import express from "express";
import cors from "cors";
import { scanGames } from "./routes/scan.js";

const app = express();

app.use(cors());
app.use(express.json());

// Teste
app.get("/", (req, res) => {
  res.send("API de apostas rodando 🚀");
});

// Scanner (AGORA COM DADOS REAIS)
app.get("/scan", async (req, res) => {
  try {
    const dados = await scanGames();
    res.json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar jogos" });
  }
});

// Porta obrigatória Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
