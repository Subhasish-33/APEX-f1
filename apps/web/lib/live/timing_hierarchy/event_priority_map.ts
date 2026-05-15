export type RaceEvent = "OVERTAKE" | "FASTEST_LAP" | "PIT_STOP" | "RADIO" | "INCIDENT";

export const EventPriorityMap: Record<RaceEvent, number> = {
  INCIDENT: 1,      // Highest priority, disrupts normal layout
  OVERTAKE: 2,      // High priority, draws eye to leaderboard
  PIT_STOP: 3,      // Medium priority, tire context updates
  FASTEST_LAP: 4,   // Medium-low priority, purple sector flashes
  RADIO: 5          // Lowest priority, ambient context
};
