import { 
  Driver,
  Constructor,
  Race, 
  RaceDetail, 
  DriverStanding, 
  ConstructorStanding,
  ConstructorHistoryEntry,
  PaginatedResponse,
  Prediction
} from "@apex/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  getDrivers: (page = 1, limit = 20) => 
    fetcher<PaginatedResponse<Driver>>(`/drivers?page=${page}&limit=${limit}`),
  
  getDriver: (ref: string) => 
    fetcher<Driver>(`/drivers/${ref}`),

  getConstructor: (ref: string) =>
    fetcher<Constructor>(`/constructors/${ref}`),
  
  getConstructors: (page = 1, limit = 20) =>
    fetcher<PaginatedResponse<Constructor>>(`/constructors?page=${page}&limit=${limit}`),
  
  getRace: (id: number) => 
    fetcher<RaceDetail>(`/races/${id}`),
  
  getSeasonRaces: (year: number) => 
    fetcher<PaginatedResponse<Race>>(`/seasons/${year}/races`),
  
  getSeasonStandings: (year: number) => 
    fetcher<PaginatedResponse<DriverStanding>>(`/seasons/${year}/standings/drivers`),

  getSeasonConstructorStandings: (year: number) =>
    fetcher<PaginatedResponse<ConstructorStanding>>(`/seasons/${year}/standings/constructors`),

  getConstructorHistory: (ref: string) =>
    fetcher<ConstructorHistoryEntry[]>(`/constructors/${ref}/history`),

  getPrediction: (raceId: number) =>
    fetcher<Prediction[]>(`/predictions/${raceId}`).catch(() => []), // Fallback if not implemented yet
};
