import { API_KEY, BASE_URL } from "../configuração/api.js";

export async function getFixtures() {
  const response = await fetch(`${BASE_URL}/fixtures?next=10`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await response.json();
  return data.response;
}

export async function getOdds(fixtureId) {
  const response = await fetch(`${BASE_URL}/odds?fixture=${fixtureId}`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await response.json();
  return data.response;
}
