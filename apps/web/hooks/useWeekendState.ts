"use client";

import { useMemo, useState, useEffect } from "react";
import { Race } from "@apex/types";

export type WeekendState = 
  | "PRE_WEEKEND"
  | "GARAGE_OPEN"
  | "FP1_LIVE"
  | "FP2_LIVE"
  | "FP3_LIVE"
  | "QUALIFYING_LIVE"
  | "SPRINT_LIVE"
  | "RACE_LIVE"
  | "CHEQUERED_FLAG"
  | "ARCHIVED_WEEKEND";

export function useWeekendState(race: Race) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const fp1 = race.fp1_date ? new Date(race.fp1_date) : null;
    const fp2 = race.fp2_date ? new Date(race.fp2_date) : null;
    const fp3 = race.fp3_date ? new Date(race.fp3_date) : null;
    const qualy = race.qualifying_date ? new Date(race.qualifying_date) : null;
    const sprint = race.sprint_date ? new Date(race.sprint_date) : null;
    const raceStart = race.date ? new Date(race.date) : null;

    if (!raceStart) return "ARCHIVED_WEEKEND";

    const currentTime = now.getTime();

    // Session Windows (in ms)
    const PRACTICE_WINDOW = 1.5 * 60 * 60 * 1000;
    const QUALY_WINDOW = 1.5 * 60 * 60 * 1000;
    const SPRINT_WINDOW = 1 * 60 * 60 * 1000;
    const RACE_WINDOW = 2.5 * 60 * 60 * 1000;
    const GARAGE_WINDOW = 24 * 60 * 60 * 1000;
    const POST_RACE_WINDOW = 12 * 60 * 60 * 1000;

    // Helper to check if time is within window
    const isLive = (start: Date | null, window: number) => {
      if (!start) return false;
      const t = start.getTime();
      return currentTime >= t && currentTime <= t + window;
    };

    if (isLive(raceStart, RACE_WINDOW)) return "RACE_LIVE";
    if (isLive(qualy, QUALY_WINDOW)) return "QUALIFYING_LIVE";
    if (isLive(sprint, SPRINT_WINDOW)) return "SPRINT_LIVE";
    if (isLive(fp3, PRACTICE_WINDOW)) return "FP3_LIVE";
    if (isLive(fp2, PRACTICE_WINDOW)) return "FP2_LIVE";
    if (isLive(fp1, PRACTICE_WINDOW)) return "FP1_LIVE";

    const raceEndTime = raceStart.getTime() + RACE_WINDOW;
    if (currentTime > raceEndTime && currentTime <= raceEndTime + POST_RACE_WINDOW) {
      return "CHEQUERED_FLAG";
    }

    if (currentTime > raceEndTime + POST_RACE_WINDOW) {
      return "ARCHIVED_WEEKEND";
    }

    const fp1Time = fp1?.getTime() || raceStart.getTime() - (48 * 60 * 60 * 1000);
    if (currentTime >= fp1Time - GARAGE_WINDOW && currentTime < fp1Time) {
      return "GARAGE_OPEN";
    }

    if (currentTime < fp1Time - GARAGE_WINDOW) {
      return "PRE_WEEKEND";
    }

    return "PRE_WEEKEND";
  }, [race, now]);
}
