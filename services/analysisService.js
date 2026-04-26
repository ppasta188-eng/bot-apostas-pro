import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

// ==============================
// POISSON
// ==============================
function fatorial(n) {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poisson(lambda, k) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / fatorial(k);
}

// ==============================
// PROBABILIDADES (COM EMPATE)
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

  // NORMALIZA (IMPORTANTÍSSIMO)
  const soma = probCasa + probEmpate + probFora;

  return {
    probCasa: probCasa / soma,
    probEmpate: probEmpate / soma,
    probFora: probFora / soma
  };
}

// ==============================
// REMOVER MARGEM
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
// LAMBDA MELHORADO
// ==============================
function estimarLambda(probCasa, probEmpate, probFora) {
  const totalGols = 2.6;

  // ajuste leve incluindo empate (melhora MUITO)
  const lambdaCasa = totalGols * (probCasa + probEmpate * 0.5);
  const lambdaFora = totalGols * (probFora + probEmpate * 0.5);

  return { lambdaCasa, lambdaFora };
}

// ==============================
// EV
// ==============================
function calcularEV(prob, odd) {
  return prob * odd - 1;
}

// ==============================
// SCAN
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

      // mercado limpo
      const probsMercado = normalizarOdds(oddCasa, oddEmpate, oddFora);

      // lambda melhorado
      const { lambdaCasa, lambdaFora } = estimarLambda(
        probsMercado.casa,
        probsMercado.empate,
        probsMercado.fora
      );

      // poisson
      const { probCasa, probEmpate, probFora } =
        calcularProbabilidades(lambdaCasa, lambdaFora);

      // EV REAL (AGORA CORRETO)
      const evCasa = calcularEV(probCasa, oddCasa);
      const evEmpate = calcularEV(probEmpate, oddEmpate);
      const evFora = calcularEV(probFora, oddFora);

      // ==============================
      // FILTRO PROFISSIONAL REAL
      // ==============================
      let recomendacao = "SEM VALOR";

      const limiteEV = 0.05;

      // evitar EV absurdo fake
      if (Math.abs(evCasa) > 0.5 || Math.abs(evFora) > 0.5) {
        recomendacao = "DESCARTADO (EV IRREAL)";
      } else if (oddCasa <= 10 && oddFora <= 10) {
        if (evCasa > limiteEV && oddCasa >= 1.5 && oddCasa <= 5) {
          recomendacao = "VALUE BET CASA";
        } else if (evFora > limiteEV && oddFora >= 1.5 && oddFora <= 5) {
          recomendacao = "VALUE BET FORA";
        } else if (evEmpate > limiteEV && oddEmpate >= 3 && oddEmpate <= 6) {
          recomendacao = "VALUE BET EMPATE";
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
        prob_empate: Number(probEmpate.toFixed(3)),
        prob_fora: Number(probFora.toFixed(3)),
        ev_casa: Number(evCasa.toFixed(3)),
        ev_empate: Number(evEmpate.toFixed(3)),
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
