import { getFixtures, getOdds } from "../serviços/apiService.js";
import { analyzeGame } from "../serviços/analysisService.js";

export async function scanGames() {
  const jogos = await getFixtures();

  let resultados = [];

  for (let jogo of jogos) {
    const odds = await getOdds(jogo.fixture.id);

    const analise = analyzeGame(jogo, odds);

    resultados.push(analise);
  }

  return resultados;
}
