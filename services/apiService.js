import axios from "axios";

const API_KEY = process.env.API_KEY;
console.log("API KEY:", API_KEY);
const BASE_URL = "https://v3.football.api-sports.io";

// 🔥 JOGOS (3 DIAS)
export async function getJogos3Dias() {
  try {
    const hoje = new Date();
    const dataFinal = new Date();

    dataFinal.setDate(hoje.getDate() + 3);

    const from = hoje.toISOString().split("T")[0];
    const to = dataFinal.toISOString().split("T")[0];

    const response = await axios.get(`${BASE_URL}/fixtures`, {
      params: { from, to },
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    return response.data.response;

  } catch (error) {
    console.error("Erro ao buscar jogos:", error.message);
    return [];
  }
}

// 🔥 ODDS
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
