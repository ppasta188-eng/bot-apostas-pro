import { getJogos3Dias } from "./apiService.js";

// 🔥 LIGAS REAIS (IDs da API - MUITO MAIS PRECISO)
const LIGAS_IDS = [
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  71,   // Brasileirão Série A
  253,  // MLS
  128,  // Argentina
  2,    // Champions League
  3     // Europa League
];

const STATUS_VALIDOS = ["NS", "1H", "HT", "2H"];

export async function scanGames() {
  try {
    const jogos = await getJogos3Dias();

    const agora = new Date();
    const limite = new Date();
    limite.setDate(agora.getDate() + 3);

    const filtrados = jogos.filter(jogo => {
      const ligaId = jogo?.league?.id;
      const status = jogo?.fixture?.status?.short;
      const dataRaw = jogo?.fixture?.date;

      if (!dataRaw) return false;

      const dataJogo = new Date(dataRaw);

      return (
        LIGAS_IDS.includes(ligaId) &&
        STATUS_VALIDOS.includes(status) &&
        dataJogo >= agora &&
        dataJogo <= limite
      );
    });

    console.log("TOTAL API:", jogos.length);
    console.log("FILTRADOS (TOP):", filtrados.length);

    return filtrados.slice(0, 10).map(jogo => ({
      jogo: `${jogo?.teams?.home?.name} vs ${jogo?.teams?.away?.name}`,
      liga: jogo?.league?.name,
      pais: jogo?.league?.country,
      horario: jogo?.fixture?.date,
      status: jogo?.fixture?.status?.short
    }));

  } catch (error) {
    console.error("ERRO NO SCAN:", error.message);
    return [];
  }
}
