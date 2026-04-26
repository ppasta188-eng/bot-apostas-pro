import axios from "axios";

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

// 🔥 BUSCAR JOGOS (TESTE FIXO PARA VALIDAR API)
export async function getJogos3Dias() {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures`, {
      params: {
        date: "2026-04-25", // 🔥 data fixa pra teste
        timezone: "America/Sao_Paulo"
      },
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    console.log("RESPOSTA API:", JSON.stringify(response.data, null, 2));

    return response.data.response;

  } catch (error) {
    console.error("Erro ao buscar jogos:", error.message);
    return [];
  }
}

// 🔥 BUSCAR ODDS
export async function getOddsByFixture(fixtureId) {
  try {
    const response = await axios.get(`${BASE_URL}/odds`, {
      params: {
        fixture: fixtureId,
        bookmaker: 8
      },
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    return response.data.response;

  } catch (error) {
    console.error("Erro ao buscar odds:", error.message);
    return [];
  }
}
