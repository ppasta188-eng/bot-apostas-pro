import { getJogos3Dias } from "./apiService.js";

const LIGAS_TOP = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Brasileirão Série A",
  "UEFA Champions League",
  "UEFA Europa League"
];

export async function scanGames() {
  const jogos = await getJogos3Dias();

  const filtrados = jogos.filter(jogo => {
    const liga = jogo?.league?.name;
    const status = jogo?.fixture?.status?.short;

    return (
      LIGAS_TOP.includes(liga) &&
      status === "NS" // só jogos não iniciados
    );
  });

  // 🔥 DEBUG (IMPORTANTE)
  console.log("TOTAL JOGOS API:", jogos.length);
  console.log("TOTAL FILTRADOS:", filtrados.length);

  return filtrados.slice(0, 10).map(jogo => ({
    jogo: `${jogo.teams.home.name} vs ${jogo.teams.away.name}`,
    liga: jogo.league.name,
    pais: jogo.league.country,
    horario: jogo.fixture.date,
    status: jogo.fixture.status.short
  }));
}
