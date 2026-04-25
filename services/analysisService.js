import { getJogos3Dias } from "./apiService.js";

const LIGAS_TOP = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Brazil",
  "Champions League",
  "Europa League"
];

const STATUS_VALIDOS = ["NS", "1H", "HT", "2H"];

export async function scanGames() {
  try {
    const jogos = await getJogos3Dias();

    const agora = new Date();
    const limite = new Date();
    limite.setDate(agora.getDate() + 3);

    const filtrados = jogos.filter(jogo => {
      const liga = jogo?.league?.name || "";
      const status = jogo?.fixture?.status?.short;
      const dataRaw = jogo?.fixture?.date;

      if (!dataRaw) return false;

      const dataJogo = new Date(dataRaw);

      // 🔥 MATCH FLEXÍVEL
      const ligaValida = LIGAS_TOP.some(l =>
        liga.toLowerCase().includes(l.toLowerCase())
      );

      return (
        ligaValida &&
        STATUS_VALIDOS.includes(status) &&
        dataJogo >= agora &&
        dataJogo <= limite
      );
    });

    console.log("TOTAL JOGOS API:", jogos?.length || 0);
    console.log("TOTAL FILTRADOS:", filtrados.length);

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
