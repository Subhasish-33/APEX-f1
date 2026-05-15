export type LifecycleState = 
  | "SCHEDULED"
  | "FORMATION_LAP"
  | "GREEN_FLAG"
  | "YELLOW_FLAG"
  | "SAFETY_CAR"
  | "VIRTUAL_SAFETY_CAR"
  | "RED_FLAG"
  | "PAUSED"
  | "CHECKERED_FLAG"
  | "COMPLETED"
  | "ARCHIVED";

export type FocusRegion = "RACE_CONTROL" | "LEADERBOARD" | "TELEMETRY" | "EDITORIAL";

export class SessionFocusManager {
  /**
   * Orchestrates which UI region receives primary attention 
   * based on the canonical race lifecycle state.
   */
  static getPrimaryFocusRegion(state: LifecycleState): FocusRegion {
    switch (state) {
      case "RED_FLAG":
      case "PAUSED":
        // During stoppage, race control and rules take precedence over timing
        return "RACE_CONTROL";
        
      case "SCHEDULED":
      case "COMPLETED":
      case "ARCHIVED":
        // Before or after a race, narrative and storytelling dominate
        return "EDITORIAL";
        
      case "SAFETY_CAR":
      case "VIRTUAL_SAFETY_CAR":
      case "YELLOW_FLAG":
        // During incidents, intervals to car ahead become hyper-critical
        return "LEADERBOARD";
        
      case "FORMATION_LAP":
      case "GREEN_FLAG":
      case "CHECKERED_FLAG":
      default:
        // Normal active racing splits focus between leaderboard and telemetry
        return "TELEMETRY";
    }
  }

  /**
   * Determines if the interface should allow high-frequency animations.
   */
  static allowHighFrequencyMotion(state: LifecycleState, isDegraded: boolean): boolean {
    if (isDegraded) return false;
    return state === "GREEN_FLAG";
  }
}
