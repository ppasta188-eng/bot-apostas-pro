import { getJogos3Dias } from "./apiService.js";

export async function scanGames() {
  try {
    const jogos = await getJogos3Dias();

    const resultados = jogos.slice(0, 10).map(jogo => {
      const home = jogo.home_team;
      const away = jogo.away_team;

      const bookmaker = jogo.bookmakers?.[0];
      const market = bookmaker?.markets?.[0];

      const odds = market?.outcomes || [];

      const casa = odds.find(o => o.name === home)?.price;
      const fora = odds.find(o => o.name === away)?.price;

      let recomendacao = "SEM DADOS";
      let ev = null;

      if (casa) {
// 🔥 REMOVE MARGEM DA CASA (OVERROUND)

const probCasa = 1 / casa;
const probFora = 1 / fora;

const soma = probCasa + probFora;

// normalização (fair probability)
const probCasaAjustada = probCasa / soma;
const probForaAjustada = probFora / soma;

// EV real (usando prob ajustada)
ev = (probCasaAjustada * casa) - 1;

        recomendacao = ev > 0 ? "VALUE BET" : "SEM VALOR";
      }

      return {
        jogo: `${home} vs ${away}`,
        odd_casa: casa,
        odd_fora: fora,
        ev,
        recomendacao
      };
    });

    return resultados;

  } catch (error) {
    console.error("Erro no scan:", error.message);
    return [];
  }
}
