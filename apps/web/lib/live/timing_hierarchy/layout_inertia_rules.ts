export class LayoutInertiaRules {
  /**
   * Adaptive Layouts must not instantly reshuffle the grid.
   * "Inertia" guarantees that if a session changes state (e.g. GREEN -> YELLOW),
   * the layout crossfades components rather than snapping, maintaining 
   * user spatial orientation over long endurance races.
   */
  static getGridTransitionClasses(): string {
    // A very slow, 1000ms ease-in-out prevents snapping layout disorientation
    return "transition-all duration-1000 ease-in-out";
  }

  static getOpacityFadeClasses(): string {
    // Elements fading in/out should take 700ms to avoid flashing anxiety
    return "transition-opacity duration-700 ease-in-out";
  }

  static shouldDelayReorder(currentFocus: string, newFocus: string): boolean {
    // If we are moving from a highly active state (TELEMETRY) to a paused state (RACE_CONTROL)
    // we want a slight delay before the layout reorders, so the user can digest the 
    // final telemetry numbers before they shrink.
    if (currentFocus === "TELEMETRY" && newFocus === "RACE_CONTROL") {
      return true;
    }
    return false;
  }
}
