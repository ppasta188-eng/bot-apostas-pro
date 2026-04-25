import axios from "axios";

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export async function getJogos3Dias() {
  try {
    const hoje = new Date();

    const datas = [
      new Date(hoje),
      new Date(hoje),
      new Date(hoje)
    ];

    datas[1].setDate(hoje.getDate() + 1);
    datas[2].setDate(hoje.getDate() + 2);

    const requests = datas.map(data =>
      axios.get(`${BASE_URL}/fixtures`, {
        params: {
          date: formatDate(data)
        },
        headers: {
          "x-apisports-key": API_KEY
        }
      })
    );

    const responses = await Promise.all(requests);

    const jogos = responses.flatMap(res => res.data.response);

    console.log("TOTAL BRUTO API:", jogos.length);

    return jogos;

  } catch (error) {
    console.error("Erro ao buscar jogos:", error.message);
    return [];
  }
}
