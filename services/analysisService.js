import { getJogos3Dias } from "./apiService.js";

// 🔥 CALCULAR PROBABILIDADES REAIS
function calcularProbabilidades(oddCasa, oddEmpate, oddFora) {
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

// 🔥 CALCULAR EV
function calcularEV(prob, odd) {
  return (prob * odd) - 1;
}

// 🔥 SCAN PRINCIPAL
export async function scanGames() {
  try {
    const jogos = await getJogos3Dias();

    console.log("TOTAL JOGOS API:", jogos.length);

    const agora = new Date();
    const limite = new Date();
    limite.setDate(agora.getDate() + 3);

    const resultados = [];

    for (const jogo of jogos) {
      try {
        const dataJogo = new Date(jogo?.commence_time);

        // 🔥 FILTRO APENAS POR DATA (SEM LIGA)
        if (dataJogo < agora || dataJogo > limite) continue;

        const bookmaker = jogo.bookmakers?.[0];
        const market = bookmaker?.markets?.find(m => m.key === "h2h");

        if (!market) continue;

        const outcomes = market.outcomes;

        const homeTeam = jogo.home_team;
        const awayTeam = jogo.away_team;

        let oddCasa = null;
        let oddEmpate = null;
        let oddFora = null;

        for (const o of outcomes) {
          if (o.name === homeTeam) oddCasa = o.price;
          else if (o.name === awayTeam) oddFora = o.price;
          else if (o.name.toLowerCase().includes("draw")) oddEmpate = o.price;
        }

        if (!oddCasa || !oddEmpate || !oddFora) continue;

        const probs = calcularProbabilidades(
          oddCasa,
          oddEmpate,
          oddFora
        );

        const evCasa = calcularEV(probs.casa, oddCasa);
        const evFora = calcularEV(probs.fora, oddFora);

        resultados.push({
          jogo: `${homeTeam} vs ${awayTeam}`,
          liga: jogo.sport_title,
          horario: jogo.commence_time,
          odd_casa: oddCasa,
          odd_empate: oddEmpate,
          odd_fora: oddFora,
          ev_casa: Number(evCasa.toFixed(3)),
          ev_fora: Number(evFora.toFixed(3)),
          recomendacao:
            evCasa > 0.05 ? "BACK CASA" :
            evFora > 0.05 ? "BACK FORA" :
            "SEM VALOR"
        });

      } catch (err) {
        console.log("Erro jogo:", err.message);
      }
    }

    console.log("TOTAL ANALISADOS:", resultados.length);

    return resultados.slice(0, 10);

  } catch (error) {
    console.error("ERRO GERAL:", error.message);
    return [];
  }
}
