import express from "express";
import cors from "cors";
import { scanGames } from "./routes/scan.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rota principal (teste)
app.get("/", (req, res) => {
  res.send("API de apostas rodando 🚀");
});

// Rota do scanner
app.get("/scan", (req, res) => {
  const dados = scanGames();
  res.json(dados);
});

// Porta obrigatória do Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
