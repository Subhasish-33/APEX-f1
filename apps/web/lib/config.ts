/**
 * Centralized API configuration for the APEX F1 frontend.
 *
 * This is the single source of truth for the API base URL.
 * No other file may hardcode 'localhost' or any API URL.
 *
 * Usage:
 *   import { API_BASE_URL } from "@/lib/config";
 */

const url = process.env.NEXT_PUBLIC_API_URL;

if (!url) {
  // Fail fast at build time if env var is missing.
  // This prevents silent localhost fallbacks reaching production.
  throw new Error(
    "[APEX F1] NEXT_PUBLIC_API_URL is not defined.\n" +
    "Set it in apps/web/.env.local (development) or as a Vercel env var (production).\n" +
    "Example: NEXT_PUBLIC_API_URL=https://your-api.railway.app"
  );
}

export const API_BASE_URL = url;

/** Default ISR revalidation interval (seconds) — used across all data fetches */
export const DEFAULT_REVALIDATE = 3600; // 1 hour

/** Short revalidation for frequently updated data (standings, latest race) */
export const SHORT_REVALIDATE = 300; // 5 minutes
