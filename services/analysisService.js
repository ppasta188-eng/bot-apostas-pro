import { getJogos3Dias, getOddsByFixture } from "./apiService.js";

const LIGAS_TOP = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Brazil",
  "Champions League",
  "Europa League"
];

const STATUS_VALIDOS = ["NS", "1H", "HT", "2H"];

export async function scanGames() {
  try {
    const jogos = await getJogos3Dias();

    const agora = new Date();
    const limite = new Date();
    limite.setDate(agora.getDate() + 3);

    const filtrados = jogos.filter(jogo => {
      const liga = jogo?.league?.name || "";
      const status = jogo?.fixture?.status?.short;
      const dataRaw = jogo?.fixture?.date;

      if (!dataRaw) return false;

      const dataJogo = new Date(dataRaw);

      const ligaValida = LIGAS_TOP.some(l =>
        liga.toLowerCase().includes(l.toLowerCase())
      );

      return (
        ligaValida &&
        STATUS_VALIDOS.includes(status) &&
        dataJogo >= agora &&
        dataJogo <= limite
      );
    });

    console.log("TOTAL JOGOS API:", jogos.length);
    console.log("TOTAL FILTRADOS:", filtrados.length);

    const resultados = [];

    for (const jogo of filtrados.slice(0, 10)) {
      const fixtureId = jogo.fixture.id;

      const oddsData = await getOddsByFixture(fixtureId);

      // 🔥 SE NÃO TEM ODDS → IGNORA
      if (!oddsData || oddsData.length === 0) {
        console.log("SEM ODDS:", fixtureId);
        continue;
      }

      try {
        const odd =
          oddsData[0]?.bookmakers[0]?.bets[0]?.values[0]?.odd;

        if (!odd) continue;

        const oddNum = parseFloat(odd);

        // 🔥 PROBABILIDADE SIMPLES (BASE INICIAL)
        const prob = 1 / oddNum;

        const ev = (prob * oddNum) - 1;

        resultados.push({
          jogo: `${jogo.teams.home.name} vs ${jogo.teams.away.name}`,
          liga: jogo.league.name,
          odd: oddNum,
          probabilidade: Number(prob.toFixed(2)),
          ev: Number(ev.toFixed(3)),
          recomendacao: ev > 0 ? "VALUE BET" : "SEM VALOR"
        });

      } catch (e) {
        console.log("ERRO AO PROCESSAR ODDS:", fixtureId);
      }
    }

    console.log("TOTAL RESULTADOS:", resultados.length);

    return resultados;

  } catch (error) {
    console.error("ERRO NO SCAN:", error.message);
    return [];
  }
}
