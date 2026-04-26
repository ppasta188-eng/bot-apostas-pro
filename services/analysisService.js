import { getJogos3Dias, getOddsByFixture } from "./apiService.js";

const STATUS_VALIDOS = ["NS", "1H", "HT", "2H"];

export async function scanGames() {
  try {
    const jogos = await getJogos3Dias();

    console.log("TOTAL JOGOS API:", jogos.length);

    const agora = new Date();

    const filtrados = jogos.filter(jogo => {
      const status = jogo?.fixture?.status?.short;
      const data = new Date(jogo?.fixture?.date);

      return (
        STATUS_VALIDOS.includes(status) &&
        data >= agora
      );
    });

    console.log("TOTAL FILTRADOS:", filtrados.length);

    const resultados = [];

    for (const jogo of filtrados.slice(0, 10)) {
      const fixtureId = jogo.fixture.id;

      let odd = null;
      let prob = null;
      let ev = null;
      let recomendacao = "SEM ODDS";

      try {
        const oddsData = await getOddsByFixture(fixtureId);

        if (oddsData.length > 0) {
          const oddRaw =
            oddsData[0]?.bookmakers[0]?.bets[0]?.values[0]?.odd;

          if (oddRaw) {
            const oddNum = parseFloat(oddRaw);

            prob = 1 / oddNum;
            ev = (prob * oddNum) - 1;

            odd = oddNum;
            recomendacao = ev > 0 ? "VALUE BET" : "SEM VALOR";
          }
        }
      } catch (e) {
        console.log("Erro odds:", fixtureId);
      }

      resultados.push({
        jogo: `${jogo.teams.home.name} vs ${jogo.teams.away.name}`,
        liga: jogo.league.name,
        pais: jogo.league.country,
        horario: jogo.fixture.date,
        odd,
        probabilidade: prob,
        ev,
        recomendacao
      });
    }

    return resultados;

  } catch (error) {
    console.error("ERRO NO SCAN:", error.message);
    return [];
  }
}
