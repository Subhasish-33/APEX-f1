# APEX-F1 Tier 3: Experience Architecture Blueprint
## Narrative Hierarchy & Motorsport Storytelling

This document defines the architectural transition from "Data Warehouse" to "Motorsport Experience," mapping how we deliver narrative value on top of our deterministic platform.

---

### 1. The Race Center IA (Information Architecture)
The Race Center is the primary container for a weekend's story. It must transition through three distinct phases:

*   **PRE-EVENT (Hype Phase)**:
    *   Focus: Standings, historical performance at this circuit, and weather predictions.
    *   UX: "The Stakes" visualization.
*   **LIVE (Action Phase)**:
    *   Focus: Intervals, lap-time deltas, pit-stop strategy, and telemetry.
    *   UX: The "Pulse" stream (Live timing + Narrative).
*   **POST-EVENT (Analysis Phase)**:
    *   Focus: Results, championship impact, and telemetry performance analysis.
    *   UX: "The Verdict" (Deterministic result summaries).

---

### 2. Narrative Hierarchy (Contextual Layers)
Data must be presented in a hierarchy that supports motorsport storytelling:

1.  **THE LEADERSHIP**: The Battle for P1 (Interval + Delta).
2.  **THE BATTLES**: Any car within < 1.0s (DRS Zone).
3.  **THE ANOMALIES**: Unexpected pit stops, yellow flags, or sudden drop in telemetry freshness.
4.  **THE STRATEGY**: Tire age, compounds, and projected pit-stop windows.

---

### 3. Experience Orchestration Philosophy
*   **State-Driven Content**: The UI must change context based on the `SessionState`. If state is `GREEN_FLAG`, the "Live Timing" module is promoted to primary focus.
*   **Contextual Deep Dives**: Clicking a driver's name shouldn't just open a bio; it should open their current telemetry profile relative to the field.
*   **Non-Blocking Experience**: Telemetry desynchronization must never freeze the UI. If a stream is `STALE`, we pivot the narrative to "Last Known Strategy."

---

### 4. Future Control Plane Direction
*   **Operator Overrides**: The ability for an "Editorial User" to pin specific battles or narrative events to the top of the feed.
*   **Truth Verification UI**: A split-view comparing platform-derived standings vs. official provider standings to allow for manual certification in outlier cases (e.g., post-race penalties).

---

### 🟢 Success Criteria for Tier 3
✔ User can follow the "Story of the Race" without external commentary.
✔ Telemetry enhances the narrative without overwhelming it.
✔ State transitions are seamless and deterministic.
✔ The platform feels "Alive" yet "Restrained."
