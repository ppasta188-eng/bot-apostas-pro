import { getJogos3Dias } from "./apiService.js";

export async function scanGames() {
  try {
    const jogos = await getJogos3Dias();

    console.log("TOTAL JOGOS API:", jogos?.length || 0);

    // 🔥 MOSTRAR 10 JOGOS REAIS DA API
    jogos.slice(0, 10).forEach(jogo => {
      console.log({
        liga: jogo?.league?.name,
        pais: jogo?.league?.country,
        status: jogo?.fixture?.status?.short,
        data: jogo?.fixture?.date
      });
    });

    return jogos.slice(0, 10).map(jogo => ({
      jogo: `${jogo?.teams?.home?.name} vs ${jogo?.teams?.away?.name}`,
      liga: jogo?.league?.name,
      pais: jogo?.league?.country,
      horario: jogo?.fixture?.date,
      status: jogo?.fixture?.status?.short
    }));

  } catch (error) {
    console.error("ERRO:", error.message);
    return [];
  }
}
