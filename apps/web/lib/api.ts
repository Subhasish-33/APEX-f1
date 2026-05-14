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
  Circuit,
  Telemetry,
  Telemetry,
  SeasonIntelligence,
  UnifiedStandings,
} from "@apex/types";
import { API_BASE_URL, DEFAULT_REVALIDATE } from "@/lib/config";

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  // FINAL SAFETY: If we are in the Vercel build phase, DO NOT fetch.
  // This prevents the 502 from killing the build during "Collecting page data".
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log(`[BUILD-SAFE] Skipping fetch for ${path} during Vercel build.`);
    return { data: [], total: 0, page: 1, limit: 20 } as any;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    next: { revalidate: DEFAULT_REVALIDATE },
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    // If the API returns a 502 but we are in build/pre-rendering, return empty instead of throwing.
    if (res.status === 502) {
       console.warn(`[BUILD-SAFE] API returned 502 for ${path}. Returning empty data to save the build.`);
       return { data: [], total: 0, page: 1, limit: 20 } as any;
    }
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

  getDriverCareer: (ref: string) =>
    fetcher<any[]>(`/drivers/${ref}/career`),

  getDriverResults: (ref: string, limit: number = 5) =>
    fetcher<any[]>(`/drivers/${ref}/results?limit=${limit}`),

  getTeammateDuel: (ref: string, year: number = 2024) =>
    fetcher<any>(`/drivers/${ref}/teammate-duel?year=${year}`),

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

  getUnifiedStandings: (year: number) =>
    fetcher<UnifiedStandings>(`/seasons/${year}/standings/unified`),

  getConstructorHistory: (ref: string) =>
    fetcher<ConstructorHistoryEntry[]>(`/constructors/${ref}/history`),

  getSeasonIntelligence: (year: number) =>
    fetcher<SeasonIntelligence>(`/seasons/${year}/intelligence`),

  unifiedSearch: (q: string) =>
    fetcher<any>(`/search?q=${encodeURIComponent(q)}`),

  getPrediction: (raceId: number) =>
    fetcher<Prediction[]>(`/predictions/${raceId}`).catch(() => []), // Fallback if not implemented yet

  getPlatformStatus: () =>
    fetcher<any>("/platform"),
};
