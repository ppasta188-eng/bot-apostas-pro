import express from "express";
import scanRoutes from "./routes/scan.js";

const app = express();

app.use(express.json());

app.use("/scan", scanRoutes);

app.get("/", (req, res) => {
  res.send("API de apostas rodando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
