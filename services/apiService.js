import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;
const BASE_URL = "https://api.the-odds-api.com/v4/sports/soccer/odds";

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

    console.log("TOTAL JOGOS:", response.data.length);

    return response.data;

  } catch (error) {
    console.error("Erro API Odds:", error.message);
    return [];
  }
}
