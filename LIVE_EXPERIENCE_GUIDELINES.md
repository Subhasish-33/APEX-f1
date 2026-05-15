# APEX-F1 Live Experience Guidelines
## Philosophy of Restraint & Technical Clarity

As APEX-F1 transitions into a live-aware platform, the temptation to create "cinematic" or "broadcast-style" UI noise increases. These guidelines exist to preserve the platform's premium, engineering-first aesthetic.

---

### 1. The Principle of Restraint
*   **Clarity > Spectacle**: Information must be readable before it is "cool."
*   **No Faux-Broadcast**: Avoid blinking lights, scanlines, or jitter effects that mimic low-quality broadcast feeds. We are a high-fidelity data platform.
*   **Zero-Jitter Telemetry**: Smooth data transitions using interpolation (Lerp), but avoid "bounce" or "elastic" animations that imply physical weight where there is only data.

---

### 2. Live-State Indicators
*   **The "LIVE" Badge**: Only visible when `SessionState == GREEN_FLAG`. It must be a steady, high-contrast indicator. No pulsing glows.
*   **Staleness Visibility**: If `TelemetryState == STALE`, the UI must desaturate data points or add a subtle "Clock" icon. Do not hide the data, but clearly mark its age.
*   **State Transitions**: When a session moves from `GREEN_FLAG` to `COMPLETED`, use a single, clean layout shift. Avoid celebratory animations.

---

### 3. Telemetry Visual Discipline
*   **Frequency Mapping**: Do not update the DOM at 60fps if the data arrives at 1Hz. Match the visual update cadence to the source truth.
*   **Color Semantics**: 
    *   **Purple**: Absolute Best (Sector/Lap).
    *   **Green**: Personal Best.
    *   **Yellow**: Slower/Standard.
    *   **Red**: Critical Error / Circuit Breaker Tripped.
*   **Micro-interactions**: Hovering over a telemetry point should reveal the exact timestamp and delta, not an abstract "performance score."

---

### 4. Information Hierarchy
*   **Primary**: Timing Delta (The Gap).
*   **Secondary**: Interval (The Car Behind).
*   **Tertiary**: Technical Telemetry (RPM, Speed, DRS).
*   **Quaternary**: Narrative Context (Team Radio, Strategy).

---

### 🟢 UX Prohibitions
1. **No Autoplay Audio**: Sound should only be used for explicit user-triggered events (e.g., clicking a radio clip).
2. **No "Loading Theater"**: Do not show fake progress bars for instant data.
3. **No Decorative Overlays**: If a UI element does not represent a data point or a navigation path, remove it.
