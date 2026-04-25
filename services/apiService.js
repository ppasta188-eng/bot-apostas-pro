import fetch from "node-fetch";

const API_KEY = process.env.API_KEY;

export async function getJogosHoje() {
  const hoje = new Date().toISOString().split("T")[0];

  const url = `https://v3.football.api-sports.io/fixtures?date=${hoje}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await response.json();

  return data.response || [];
}
