const BASE_URL = "http://127.0.0.1:8000";

export interface DriverStanding {
  name: string;
  points: number;
  position: number;
}

export interface Race {
  race_id: number;
  name: string;
  date: string;
}

export async function getStandings(): Promise<DriverStanding[]> {
  const res = await fetch(`${BASE_URL}/standings/drivers`);
  return res.json();
}

export async function getRaces(year: number): Promise<Race[]> {
  const res = await fetch(`${BASE_URL}/races?year=${year}`);
  return res.json();
}