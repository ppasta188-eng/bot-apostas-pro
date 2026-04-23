require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 API (já integrada)
const API_KEY = "db35981a3923c31b59c50ccdb235b5c1";
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

// ================= MÉTRICAS =================
function calcularForma(form) {
  if (!form) return 5;

  let pontos = 0;
  for (let r of form.slice(-5)) {
    if (r === "W") pontos += 3;
    else if (r === "D") pontos += 1;
  }
  return Math.min(10, pontos);
}

async function getStats(teamId, league) {
  const stats = await request(`/teams/statistics?team=${teamId}&league=${league}&season=2025`);
  if (!stats) return null;

  return {
    gols: parseFloat(stats.goals.for.total.avg) || 1,
    sofridos: parseFloat(stats.goals.against.total.avg) || 1,
    forma: stats.form || "",
    clean: stats.clean_sheet.total || 0,
    falhou: stats.failed_to_score.total || 0
  };
}

// ================= SCORE PROFISSIONAL =================
function calcularScore(stats, isHome) {
  const ataque = Math.min(10, stats.gols * 2);
  const defesa = Math.max(0, 10 - stats.sofridos * 2);
  const forma = calcularForma(stats.forma);
  const mando = isHome ? 7 : 4;
  const elenco = 6;

  const score =
    ataque * 2 +
    defesa * 2 +
    ataque * 3 +
    forma +
    mando +
    elenco;

  return {
    score,
    ataque,
    defesa,
    forma,
    mando,
    elenco
  };
}

// ================= INTERPRETAÇÃO =================
function interpretar(diff) {
  if (diff >= 13) return "🔥 Forte oportunidade";
  if (diff >= 8) return "✅ Boa oportunidade";
  if (diff >= 4) return "⚠️ Leve vantagem";
  return "❌ Equilibrado";
}

// ================= PRINCIPAL =================
app.get("/", async (req, res) => {
  let resultados = [];

  const ligas = [71, 39, 140, 135, 78, 61];

  for (let liga of ligas) {
    const jogos = await request(`/fixtures?league=${liga}&season=2025&next=5`);
    if (!jogos) continue;

    for (let jogo of jogos) {
      const home = jogo.teams.home;
      const away = jogo.teams.away;

      const statsHome = await getStats(home.id, liga);
      const statsAway = await getStats(away.id, liga);

      if (!statsHome || !statsAway) continue;

      const sHome = calcularScore(statsHome, true);
      const sAway = calcularScore(statsAway, false);

      const diff = Math.abs(sHome.score - sAway.score);

      resultados.push({
        jogo: `${home.name} vs ${away.name}`,
        scoreCasa: sHome.score,
        scoreFora: sAway.score,
        diferenca: diff,
        leitura: interpretar(diff)
      });
    }
  }

  res.json(resultados);
});

app.listen(3000, () => console.log("🔥 BOT ONLINE 🔥"));
