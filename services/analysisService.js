export async function getOddsByFixture(fixtureId) {
  try {
    const response = await axios.get(`${BASE_URL}/odds`, {
      params: {
        fixture: fixtureId,
        bookmaker: 8 // Bet365 (mais confiável)
      },
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    return response.data.response;

  } catch (error) {
    console.error("Erro ao buscar odds:", error.message);
    return [];
  }
}
