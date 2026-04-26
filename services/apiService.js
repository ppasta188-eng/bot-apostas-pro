import axios from "axios";

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://api.the-odds-api.com/v4/sports/soccer/odds";

// 🔥 BUSCAR JOGOS + ODDS (3 DIAS)
export async function getJogos3Dias() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apiKey: API_KEY,
        regions: "eu",
        markets: "h2h",
        oddsFormat: "decimal"
      }
    });

    return response.data;

  } catch (error) {
    console.error("Erro ao buscar jogos:", error.message);
    return [];
  }
}
