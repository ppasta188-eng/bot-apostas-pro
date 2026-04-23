require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 API via variável de ambiente
const API_KEY = process.env.API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

// ================= REQUEST =================
async function request(url) {
  try {
    const res = await axios.get(BASE_URL + url, {
      headers: { "x-apisports-key": API_KEY }
    });
    return res.data.response;
  } catch (err) {
    console.log("Erro API:", err.message);
    return null;
  }
}

// ================= TESTE =================
app.get("/", (req, res) => {
  res.json({ status: "Bot rodando 🚀" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 BOT ONLINE 🔥");
});
