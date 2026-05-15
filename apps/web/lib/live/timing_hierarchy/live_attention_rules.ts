import { LifecycleState } from './session_focus_manager';

export class LiveAttentionRules {
  static shouldHighlightInterval(intervalS: number, state: LifecycleState): boolean {
    if (state !== "GREEN_FLAG") return false;
    return intervalS < 1.0; // DRS Threat
  }

  static getOvertakeAnimationDuration(priority: number): string {
    return priority <= 2 ? "duration-500" : "duration-1000";
  }
}
