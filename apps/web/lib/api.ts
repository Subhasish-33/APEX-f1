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
  SeasonIntelligence,
  UnifiedStandings,
} from "@apex/types";
import { API_BASE_URL, DEFAULT_REVALIDATE } from "@/lib/config";

export interface DriverCareerEntry {
  year: number;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
}

export interface DriverResultEntry {
  race?: {
    name: string;
    date: string;
    circuit?: {
      name: string;
    };
  };
  grid: number;
  position?: number;
  points: number;
  constructor?: Constructor;
}

export interface TeammateDuel {
  teammate?: Driver;
  race_h2h?: [number, number];
  qualifying_h2h?: [number, number];
}

export interface LiveEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  state: {
    freshness: "LIVE" | "STALE" | "HISTORICAL";
    certification: "CERTIFIED" | "PROVISIONAL" | "UNVERIFIED";
    degraded: boolean;
  };
}

export interface LiveLeaderboardRow {
  position?: number;
  driver_ref?: string;
  driver_id?: number;
  team_ref?: string;
  points?: number;
  status?: string;
  gap?: string;
  pits?: number;
}

type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
  state?: Record<string, unknown>;
  pagination?: {
    total?: number;
    page?: number;
    size?: number;
    has_next?: boolean;
  };
};

const emptyUnifiedStandings = (year: number): UnifiedStandings => ({
  season: year,
  status: "DEGRADED",
  is_verified: false,
  coverage_confidence: 0,
  last_audit_at: new Date(0).toISOString(),
  drivers: [],
  constructors: [],
  freshness: new Date(0).toISOString(),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return isRecord(value) && "data" in value;
}

function emptyPaginated<T>(page: number, limit: number): PaginatedResponse<T> {
  return {
    total_count: 0,
    page,
    limit,
    data: [],
  };
}

function normalizePaginated<T>(
  payload: unknown,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  if (!isRecord(payload)) return emptyPaginated<T>(page, limit);

  const data = Array.isArray(payload.data) ? (payload.data as T[]) : [];
  const pagination = isRecord(payload.pagination) ? payload.pagination : undefined;
  const totalCount =
    typeof payload.total_count === "number"
      ? payload.total_count
      : typeof pagination?.total === "number"
        ? pagination.total
        : data.length;

  return {
    total_count: totalCount,
    page:
      typeof payload.page === "number"
        ? payload.page
        : typeof pagination?.page === "number"
          ? pagination.page
          : page,
    limit:
      typeof payload.limit === "number"
        ? payload.limit
        : typeof pagination?.size === "number"
          ? pagination.size
          : limit,
    data,
    freshness:
      typeof payload.freshness === "string" ? payload.freshness : undefined,
  };
}

function unwrapData<T>(payload: unknown, fallback: T): T {
  if (isEnvelope<T>(payload)) return payload.data ?? fallback;
  return (payload as T) ?? fallback;
}

async function fetchJson(path: string, options?: RequestInit): Promise<unknown> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log(`[BUILD-SAFE] Skipping fetch for ${path} during Vercel build.`);
    return undefined;
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
    if (res.status === 502) {
       console.warn(`[API] Upstream returned 502 for ${path}. Returning degraded fallback.`);
       return undefined;
    }
    const errorData = await res.json().catch(() => ({}));
    const detail = isRecord(errorData) && typeof errorData.detail === "string"
      ? errorData.detail
      : `API Error: ${res.status}`;
    throw new Error(detail);
  }

  return res.json();
}

export const api = {
  getDrivers: (page = 1, limit = 20) => 
    fetchJson(`/drivers?page=${page}&limit=${limit}`).then((payload) =>
      normalizePaginated<Driver>(payload, page, limit),
    ),
  
  getDriver: (ref: string) => 
    fetchJson(`/drivers/${ref}`).then((payload) => unwrapData<Driver | null>(payload, null)),

  getDriverCareer: (ref: string) =>
    fetchJson(`/drivers/${ref}/career`).then((payload) => unwrapData<DriverCareerEntry[]>(payload, [])),

  getDriverResults: (ref: string, limit: number = 5) =>
    fetchJson(`/drivers/${ref}/results?limit=${limit}`).then((payload) => unwrapData<DriverResultEntry[]>(payload, [])),

  getTeammateDuel: (ref: string, year: number = 2024) =>
    fetchJson(`/drivers/${ref}/teammate-duel?year=${year}`).then((payload) => unwrapData<TeammateDuel | null>(payload, null)),

  getConstructor: (ref: string) =>
    fetchJson(`/constructors/${ref}`).then((payload) => unwrapData<Constructor | null>(payload, null)),
  
  getConstructors: (page = 1, limit = 20) =>
    fetchJson(`/constructors?page=${page}&limit=${limit}`).then((payload) =>
      normalizePaginated<Constructor>(payload, page, limit),
    ),
  
  getCircuit: (ref: string) =>
    fetchJson(`/circuits/${ref}`).then((payload) => unwrapData<Circuit | null>(payload, null)),
  
  getRace: (id: number) => 
    fetchJson(`/races/${id}`).then((payload) => unwrapData<RaceDetail | null>(payload, null)),
  
  getRaceTelemetry: (id: number) =>
    fetchJson(`/races/${id}/lap-times`).then((payload) => unwrapData<Telemetry[]>(payload, [])),
  
  getSeasonRaces: (year: number) => 
    fetchJson(`/seasons/${year}/races`).then((payload) =>
      normalizePaginated<Race>(payload, 1, 20),
    ),
  
  getSeasonStandings: (year: number) => 
    fetchJson(`/seasons/${year}/standings/drivers`).then((payload) =>
      normalizePaginated<DriverStanding>(payload, 1, 20),
    ),

  getSeasonConstructorStandings: (year: number) =>
    fetchJson(`/seasons/${year}/standings/constructors`).then((payload) =>
      normalizePaginated<ConstructorStanding>(payload, 1, 20),
    ),

  getUnifiedStandings: (year: number) =>
    fetchJson(`/seasons/${year}/standings/unified`).then((payload) =>
      unwrapData<UnifiedStandings>(payload, emptyUnifiedStandings(year)),
    ),

  getConstructorHistory: (ref: string) =>
    fetchJson(`/constructors/${ref}/history`).then((payload) => unwrapData<ConstructorHistoryEntry[]>(payload, [])),

  getSeasonIntelligence: (year: number) =>
    fetchJson(`/seasons/${year}/intelligence`).then((payload) =>
      unwrapData<SeasonIntelligence | null>(payload, null),
    ),

  unifiedSearch: (q: string) =>
    fetchJson(`/search?q=${encodeURIComponent(q)}`).then((payload) =>
      unwrapData<Record<string, unknown>>(payload, {}),
    ),

  getPrediction: (raceId: number) =>
    fetchJson(`/predictions/${raceId}`).then((payload) => unwrapData<Prediction[]>(payload, [])).catch(() => []),

  getLiveLeaderboard: () =>
    fetchJson("/live/leaderboard").then((payload) => {
      const fallback: LiveEnvelope<LiveLeaderboardRow[]> = {
        data: [],
        state: {
          freshness: "HISTORICAL",
          certification: "UNVERIFIED",
          degraded: true,
        },
      };
      if (!isEnvelope<LiveLeaderboardRow[]>(payload)) return fallback;
      const state = isRecord(payload.state) ? payload.state : {};
      return {
        data: Array.isArray(payload.data) ? payload.data : [],
        meta: payload.meta,
        state: {
          freshness:
            state.freshness === "LIVE" || state.freshness === "STALE" || state.freshness === "HISTORICAL"
              ? state.freshness
              : "HISTORICAL",
          certification:
            state.certification === "CERTIFIED" ||
            state.certification === "PROVISIONAL" ||
            state.certification === "UNVERIFIED"
              ? state.certification
              : "UNVERIFIED",
          degraded: typeof state.degraded === "boolean" ? state.degraded : true,
        },
      } satisfies LiveEnvelope<LiveLeaderboardRow[]>;
    }),

  getPlatformStatus: () =>
    fetchJson("/health/system").then((payload) => unwrapData<Record<string, unknown>>(payload, {})),
};
