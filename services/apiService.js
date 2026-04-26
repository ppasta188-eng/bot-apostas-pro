import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY; // ✅ PADRÃO CORRETO
const BASE_URL = "https://api.the-odds-api.com/v4/sports/soccer/odds";

export async function getJogos3Dias() {
  try {
    console.log("API KEY:", API_KEY); // 🔍 DEBUG

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
    console.error(
      "Erro ao buscar jogos:",
      error.response?.data || error.message
    );
    return [];
  }
}
