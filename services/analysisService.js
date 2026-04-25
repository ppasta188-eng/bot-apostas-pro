import { getJogos3Dias, getOddsByFixture } from "./apiService.js";

// Ligas top (IDs oficiais)
const LIGAS_IDS = [39, 140, 135, 78, 61, 71, 253, 128, 2, 3];

const STATUS_VALIDOS = ["NS"];

function calcularProbabilidadeImplicita(odd) {
  return 1 / odd;
}

// 🔥 MODELO SIMPLES (depois vamos evoluir pra Poisson)
function estimarProbabilidade(odd) {
  // leve ajuste para simular edge
  return (1 / odd) * 1.08;
}

export async function scanGames() {
  try {
    const jogos = await getJogos3Dias();

    const agora = new Date();
    const limite = new Date();
    limite.setDate(agora.getDate() + 3);

    const jogosFiltrados = jogos.filter(jogo => {
      const ligaId = jogo?.league?.id;
      const status = jogo?.fixture?.status?.short;
      const dataJogo = new Date(jogo?.fixture?.date);

      return (
        LIGAS_IDS.includes(ligaId) &&
        STATUS_VALIDOS.includes(status) &&
        dataJogo >= agora &&
        dataJogo <= limite
      );
    });

    const resultados = [];

    for (const jogo of jogosFiltrados.slice(0, 10)) {
      const fixtureId = jogo.fixture.id;

      const oddsData = await getOddsByFixture(fixtureId);

      if (!oddsData.length) continue;

      const bookmakers = oddsData[0].bookmakers;
      if (!bookmakers.length) continue;

      const markets = bookmakers[0].bets;

      const matchOdds = markets.find(m => m.name === "Match Winner");
      if (!matchOdds) continue;

      const oddsCasa = parseFloat(matchOdds.values[0].odd);
      const oddsEmpate = parseFloat(matchOdds.values[1].odd);
      const oddsFora = parseFloat(matchOdds.values[2].odd);

      // Probabilidades mercado
      const pCasaMercado = calcularProbabilidadeImplicita(oddsCasa);
      const pEmpateMercado = calcularProbabilidadeImplicita(oddsEmpate);
      const pForaMercado = calcularProbabilidadeImplicita(oddsFora);

      // Probabilidades modelo (simples por enquanto)
      const pCasaModelo = estimarProbabilidade(oddsCasa);
      const pEmpateModelo = estimarProbabilidade(oddsEmpate);
      const pForaModelo = estimarProbabilidade(oddsFora);

      // EV
      const evCasa = (pCasaModelo * oddsCasa) - 1;
      const evEmpate = (pEmpateModelo * oddsEmpate) - 1;
      const evFora = (pForaModelo * oddsFora) - 1;

      const melhor = [
        { tipo: "Casa", ev: evCasa, odd: oddsCasa },
        { tipo: "Empate", ev: evEmpate, odd: oddsEmpate },
        { tipo: "Fora", ev: evFora, odd: oddsFora }
      ].sort((a, b) => b.ev - a.ev)[0];

      if (melhor.ev > 0) {
        resultados.push({
          jogo: `${jogo.teams.home.name} vs ${jogo.teams.away.name}`,
          mercado: melhor.tipo,
          odd: melhor.odd,
          ev: (melhor.ev * 100).toFixed(2) + "%",
          confianca: melhor.ev > 0.1 ? "Alta" : "Média"
        });
      }
    }

    console.log("RESULTADOS COM VALOR:", resultados.length);

    return resultados;

  } catch (error) {
    console.error("ERRO:", error.message);
    return [];
  }
}
