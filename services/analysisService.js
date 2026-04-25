export function analyzeGame(fixture, odds) {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;

  let resultado = {
    jogo: `${home} vs ${away}`,
    recomendacao: "SEM VALOR",
    risco: "ALTO"
  };

  if (!odds || odds.length === 0) return resultado;

  try {
    const bets = odds[0].bookmakers[0].bets;

    const overUnder = bets.find(b => b.name === "Goals Over/Under");

    if (overUnder) {
      const over25 = overUnder.values.find(v => v.value === "Over 2.5");

      if (over25 && parseFloat(over25.odd) >= 1.70) {
        resultado.recomendacao = "OVER 2.5";
        resultado.risco = "MÉDIO";
      }
    }

  } catch (erro) {
    console.log("Erro:", erro);
  }

  return resultado;
}
