import { getJogosHoje } from "../services/apiService.js";

export async function scanGames() {
  const jogos = await getJogosHoje();

  return jogos.slice(0, 10).map(jogo => ({
    jogo: `${jogo.teams.home.name} vs ${jogo.teams.away.name}`,
    liga: jogo.league.name,
    pais: jogo.league.country,
    data: jogo.fixture.date,
    status: jogo.fixture.status.short
  }));
}
