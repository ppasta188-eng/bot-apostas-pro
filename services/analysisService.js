import { getJogos3Dias } from "./apiService.js";

// 🔥 Remove margem da casa
function calcularProbabilidadesJustas(oddCasa, oddEmpate, oddFora) {
  const pCasa = 1 / oddCasa;
  const pEmpate = 1 / oddEmpate;
  const pFora = 1 / oddFora;

  const soma = pCasa + pEmpate + pFora;

  return {
    casa: pCasa / soma,
    empate: pEmpate / soma,
    fora: pFora / soma
  };
}

// 🔥 EV correto
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

      // 🔥 Mercado sem margem
      const probs = calcularProbabilidadesJustas(
        oddCasa,
        oddEmpate,
        oddFora
      );

      // 🔥 AQUI É O PONTO PROFISSIONAL:
      // ainda usamos mercado (neutro), então EV tende a 0 ou negativo
      const evCasa = calcularEV(probs.casa, oddCasa);
      const evFora = calcularEV(probs.fora, oddFora);

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
        prob_casa: Number(probs.casa.toFixed(3)),
        prob_fora: Number(probs.fora.toFixed(3)),
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
