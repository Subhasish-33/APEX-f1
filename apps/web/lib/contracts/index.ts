import { z } from "zod";

/**
 * APEX-F1 API Contracts
 * 
 * Strict Zod schemas for all backend responses to prevent runtime crashes
 * and ensure data integrity at the edge.
 */

// ── Base Entities ──────────────────────────────────────────────────────────

export const DriverSchema = z.object({
  driver_id: z.number(),
  full_name: z.string(),
  surname: z.string(),
  code: z.string().nullable().optional(),
  number: z.number().nullable().optional(),
  nationality: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const TeamSchema = z.object({
  team_id: z.number(),
  name: z.string(),
  full_name: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  base: z.string().nullable().optional(),
  team_principal: z.string().nullable().optional(),
  chassis: z.string().nullable().optional(),
  power_unit: z.string().nullable().optional(),
});

export const StandingSchema = z.object({
  position: z.number(),
  points: z.number(),
  wins: z.number(),
  driver: DriverSchema.optional(),
  team: TeamSchema.optional(),
});

export const RaceSchema = z.object({
  race_id: z.number(),
  season: z.number(),
  round: z.number(),
  name: z.string(),
  date: z.string(),
  time: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  circuit_name: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export const TelemetrySchema = z.object({
  telemetry_id: z.number(),
  race_id: z.number(),
  driver_id: z.number(),
  lap_number: z.number(),
  position: z.number().nullable().optional(),
  lap_time: z.string().nullable().optional(),
  speed: z.number().nullable().optional(),
  gear: z.number().nullable().optional(),
  rpm: z.number().nullable().optional(),
});

export const PredictionSchema = z.object({
  race_id: z.number(),
  driver_id: z.number(),
  predicted_position: z.number(),
  probability: z.number(),
  confidence_score: z.number(),
  reasoning: z.string().nullable().optional(),
});

// ── Response Envelopes ──────────────────────────────────────────────────────

export const DriversResponseSchema = z.array(DriverSchema);
export const TeamsResponseSchema = z.array(TeamSchema);
export const StandingsResponseSchema = z.object({
  season: z.number(),
  standings: z.array(StandingSchema),
});
export const RacesResponseSchema = z.array(RaceSchema);

export type Driver = z.infer<typeof DriverSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Standing = z.infer<typeof StandingSchema>;
export type Race = z.infer<typeof RaceSchema>;
export type Telemetry = z.infer<typeof TelemetrySchema>;
export type Prediction = z.infer<typeof PredictionSchema>;
