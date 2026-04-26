import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

// ==============================
// POISSON
// ==============================
function fatorial(n) {
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poisson(lambda, k) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / fatorial(k);
}

// ==============================
// PROBABILIDADE DE VITÓRIA
// ==============================
function calcularProbabilidades(lambdaCasa, lambdaFora) {
  let probCasa = 0;
  let probFora = 0;
  let probEmpate = 0;

  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 6; j++) {
      const p = poisson(lambdaCasa, i) * poisson(lambdaFora, j);

      if (i > j) probCasa += p;
      else if (i < j) probFora += p;
      else probEmpate += p;
    }
  }

  return { probCasa, probEmpate, probFora };
}

// ==============================
// REMOVER MARGEM DA CASA
// ==============================
function normalizarOdds(oddCasa, oddEmpate, oddFora) {
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

// ==============================
// CALCULAR LAMBDA (gols esperados)
// ==============================
// aproximação baseada no mercado (já MUITO melhor que antes)
function estimarLambda(probCasa, probFora) {
  const totalGols = 2.6; // média global futebol

  const lambdaCasa = totalGols * (probCasa / (probCasa + probFora));
  const lambdaFora = totalGols * (probFora / (probCasa + probFora));

  return { lambdaCasa, lambdaFora };
}

// ==============================
// EV
// ==============================
function calcularEV(prob, odd) {
  return prob * odd - 1;
}

// ==============================
// SCAN PRINCIPAL
// ==============================
export async function scanGames() {
  try {
    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds?apiKey=${API_KEY}&regions=eu&markets=h2h`;

    const response = await axios.get(url);
    const jogos = response.data;

    const resultados = [];

    for (const jogo of jogos) {
      if (!jogo.bookmakers?.length) continue;

      const odds = jogo.bookmakers[0].markets[0].outcomes;

      const oddCasa = odds.find(o => o.name === jogo.home_team)?.price;
      const oddFora = odds.find(o => o.name === jogo.away_team)?.price;
      const oddEmpate = odds.find(o => o.name === "Draw")?.price;

      if (!oddCasa || !oddFora || !oddEmpate) continue;

      // remover margem
      const probsMercado = normalizarOdds(oddCasa, oddEmpate, oddFora);

      // estimar gols
      const { lambdaCasa, lambdaFora } = estimarLambda(
        probsMercado.casa,
        probsMercado.fora
      );

      // aplicar poisson
      const { probCasa, probEmpate, probFora } =
        calcularProbabilidades(lambdaCasa, lambdaFora);

      // EV real
      const evCasa = calcularEV(probCasa, oddCasa);
      const evFora = calcularEV(probFora, oddFora);

      // ==============================
      // FILTRO PROFISSIONAL
      // ==============================
      let recomendacao = "SEM VALOR";

      if (oddCasa <= 10 && oddFora <= 10) {
        if (evCasa > 0.05 && oddCasa >= 1.5 && oddCasa <= 5) {
          recomendacao = "VALUE BET CASA";
        } else if (evFora > 0.05 && oddFora >= 1.5 && oddFora <= 5) {
          recomendacao = "VALUE BET FORA";
        }
      } else {
        recomendacao = "IGNORADO (ODD EXTREMA)";
      }

      resultados.push({
        jogo: `${jogo.home_team} vs ${jogo.away_team}`,
        liga: jogo.sport_title,
        horario: jogo.commence_time,
        odd_casa: oddCasa,
        odd_empate: oddEmpate,
        odd_fora: oddFora,
        lambda_casa: Number(lambdaCasa.toFixed(2)),
        lambda_fora: Number(lambdaFora.toFixed(2)),
        prob_casa: Number(probCasa.toFixed(3)),
        prob_fora: Number(probFora.toFixed(3)),
        ev_casa: Number(evCasa.toFixed(3)),
        ev_fora: Number(evFora.toFixed(3)),
        recomendacao
      });
    }

    console.log("TOTAL JOGOS API:", jogos.length);
    console.log("TOTAL ANALISADOS:", resultados.length);

    return resultados;

  } catch (error) {
    console.error("Erro:", error.message);
    return [];
  }
}
