import { getJogos3Dias } from "./apiService.js";

// 🔥 Converter odds em probabilidade (mercado)
function probFromOdd(odd) {
  return 1 / odd;
}

// 🔥 Remove margem
function normalizarProbabilidades(pCasa, pEmpate, pFora) {
  const soma = pCasa + pEmpate + pFora;

  return {
    casa: pCasa / soma,
    empate: pEmpate / soma,
    fora: pFora / soma
  };
}

// 🔥 MODELO SIMPLES (proxy de força)
function modeloProbabilidade(pMercado) {
  // ajuste baseado em "força" simulada
  let ajuste = 0;

  if (pMercado > 0.6) ajuste = 0.05;        // favoritos ficam mais fortes
  else if (pMercado < 0.2) ajuste = -0.03;  // zebras pioram
  else ajuste = 0.02;

  const p = pMercado + ajuste;

  return Math.max(0.01, Math.min(0.99, p));
}

// 🔥 EV
function calcularEV(prob, odd) {
  return (prob * odd) - 1;
}

export async function analisarJogos() {
  try {
    const jogos = await getJogos3Dias();

    console.log("TOTAL JOGOS API:", jogos.length);

    const analisados = jogos.map(jogo => {
      const home = jogo.home_team;
      const away = jogo.away_team;
      const liga = jogo.sport_title;
      const horario = jogo.commence_time;

      const bookmaker = jogo.bookmakers?.[0];
      const market = bookmaker?.markets?.[0];
      const odds = market?.outcomes;

      if (!odds || odds.length < 3) return null;

      const oddCasa = odds.find(o => o.name === home)?.price;
      const oddEmpate = odds.find(o => o.name === "Draw")?.price;
      const oddFora = odds.find(o => o.name === away)?.price;

      if (!oddCasa || !oddEmpate || !oddFora) return null;

      // 🔥 Prob mercado
      const pCasa = probFromOdd(oddCasa);
      const pEmpate = probFromOdd(oddEmpate);
      const pFora = probFromOdd(oddFora);

      const probsMercado = normalizarProbabilidades(pCasa, pEmpate, pFora);

      // 🔥 MODELO (agora independente)
      const probCasaModelo = modeloProbabilidade(probsMercado.casa);
      const probForaModelo = modeloProbabilidade(probsMercado.fora);

      // 🔥 EV REAL
      const evCasa = calcularEV(probCasaModelo, oddCasa);
      const evFora = calcularEV(probForaModelo, oddFora);

      let recomendacao = "SEM VALOR";

      if (evCasa > 0.05) recomendacao = "VALUE BET CASA";
      else if (evFora > 0.05) recomendacao = "VALUE BET FORA";

      return {
        jogo: `${home} vs ${away}`,
        liga,
        horario,
        odd_casa: oddCasa,
        odd_empate: oddEmpate,
        odd_fora: oddFora,
        prob_casa_modelo: Number(probCasaModelo.toFixed(3)),
        prob_fora_modelo: Number(probForaModelo.toFixed(3)),
        ev_casa: Number(evCasa.toFixed(3)),
        ev_fora: Number(evFora.toFixed(3)),
        recomendacao
      };

    }).filter(Boolean);

    console.log("TOTAL ANALISADOS:", analisados.length);

    return analisados;

  } catch (error) {
    console.error("ERRO NA ANALISE:", error.message);
    return [];
  }
}
