import { z } from "zod";
import { monitoring } from "./monitoring";
import { logger } from "./logger";
import { 
  DriversResponseSchema, 
  TeamsResponseSchema, 
  StandingsResponseSchema, 
  RacesResponseSchema 
} from "./contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const DEFAULT_TIMEOUT = 8000;
const MAX_RETRIES = 2;

export interface ApiOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  schema?: z.ZodSchema;
}

export class ApiError extends Error {
  constructor(public message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchSafe<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES, schema, ...fetchOptions } = options;
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const startTime = Date.now();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, "HTTP_ERROR");
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      monitoring.trackApiLatency(endpoint, duration, true);

      // Validate schema if provided
      if (schema) {
        const result = schema.safeParse(data);
        if (!result.success) {
          logger.error(`Contract Validation Failed: ${endpoint}`, { 
            errors: result.error.format(),
            data 
          });
          throw new ApiError("API Contract Violation", 500, "SCHEMA_ERROR");
        }
        return result.data;
      }
      
      return data;
    } catch (error: any) {
      clearTimeout(id);
      lastError = error;
      const duration = Date.now() - startTime;
      monitoring.trackApiLatency(endpoint, duration, false);

      if (attempt < retries) {
        monitoring.trackRetry(endpoint, attempt + 1, error.message);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
  }
  
  throw lastError || new ApiError("Unknown API Error", 500, "UNKNOWN");
}

export const apiSafe = {
  getDrivers: () => fetchSafe("/drivers", { schema: DriversResponseSchema }),
  getTeams: () => fetchSafe("/teams", { schema: TeamsResponseSchema }),
  getStandings: (season: number = 2024) => fetchSafe(`/standings?season=${season}`, { schema: StandingsResponseSchema }),
  getRaces: (season: number = 2024) => fetchSafe(`/races?season=${season}`, { schema: RacesResponseSchema }),
  
  getWithFallback: async <T>(endpoint: string, fallback: T, schema?: z.ZodSchema): Promise<T> => {
    try {
      return await fetchSafe<T>(endpoint, { schema });
    } catch (error) {
      logger.warn(`[API] Degrading to fallback for ${endpoint}`);
      return fallback;
    }
  }
};
