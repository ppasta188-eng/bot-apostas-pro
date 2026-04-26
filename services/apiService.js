import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

export async function getJogos3Dias() {
  try {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 3);

    const from = hoje.toISOString();
    const to = amanha.toISOString();

    const response = await axios.get("https://api.the-odds-api.com/v4/sports/soccer/odds", {
      params: {
        apiKey: API_KEY,
        regions: "eu",
        markets: "h2h",
        oddsFormat: "decimal",
        dateFormat: "iso"
      }
    });

    return response.data;

  } catch (error) {
    console.error("Erro ao buscar jogos:", error.message);
    return [];
  }
}
