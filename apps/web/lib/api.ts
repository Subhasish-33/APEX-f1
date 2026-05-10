import {
  Driver,
  Constructor,
  Race,
  RaceDetail,
  DriverStanding,
  ConstructorStanding,
  ConstructorHistoryEntry,
  PaginatedResponse,
  Prediction,
} from "@apex/types";
import { API_BASE_URL, DEFAULT_REVALIDATE } from "@/lib/config";

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    next: { revalidate: DEFAULT_REVALIDATE },
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
  
  getCircuit: (ref: string) =>
    fetcher<Circuit>(`/circuits/${ref}`),
  
  getRace: (id: number) => 
    fetcher<RaceDetail>(`/races/${id}`),
  
  getRaceTelemetry: (id: number) =>
    fetcher<Telemetry[]>(`/races/${id}/lap-times`),
  
  getSeasonRaces: (year: number) => 
    fetcher<PaginatedResponse<Race>>(`/seasons/${year}/races`),
  
  getSeasonStandings: (year: number) => 
    fetcher<PaginatedResponse<DriverStanding>>(`/seasons/${year}/standings/drivers`),

  getSeasonConstructorStandings: (year: number) =>
    fetcher<PaginatedResponse<ConstructorStanding>>(`/seasons/${year}/standings/constructors`),

  getConstructorHistory: (ref: string) =>
    fetcher<ConstructorHistoryEntry[]>(`/constructors/${ref}/history`),

  getSeasonIntelligence: (year: number) =>
    fetcher<SeasonIntelligence>(`/seasons/${year}/intelligence`),

  unifiedSearch: (q: string) =>
    fetcher<any>(`/search?q=${encodeURIComponent(q)}`),

  getPrediction: (raceId: number) =>
    fetcher<Prediction[]>(`/predictions/${raceId}`).catch(() => []), // Fallback if not implemented yet
};
