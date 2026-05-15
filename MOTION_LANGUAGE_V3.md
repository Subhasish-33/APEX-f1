# APEX-F1 Motion Language V3
# Tier 5 / Phase 3 — Cinematic Editorial Experience

## Purpose
Motion in APEX-F1 is an instrument, not an effect. It creates a rhythm of mechanical precision, allowing users to feel the live state of the data. 

## 1. Principles of Movement
- **No Bounce Physics**: Spring animations are forbidden. F1 cars do not bounce; telemetry does not bounce. We use tight, linear or subtle cubic-bezier easing.
- **Instrument-Grade**: Ticking, cycling, and scanning motions are preferred over swooping or scaling motions.
- **Timing vs. Duration**: UI elements enter rapidly (150-250ms) but settle deliberately. Data cycles instantaneously (0ms) to ensure truth is never delayed by animation frames.

## 2. Allowed Motion Primitives

| Primitive | Use Case | Easing | Duration |
|-----------|----------|--------|----------|
| **Telemetry Ticking** | Live sector times, RPM, speed | `steps(1)` or None | 0ms |
| **Restrained Fades** | Image lazy-loading, tab switching | `ease-in-out` | 300ms |
| **Tabular Numeral Cycling** | Leaderboard position swaps | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 400ms |
| **Precision Interpolation** | Live track map car dots | Linear | Match telemetry rate |
| **Subtle Scan Movement** | Background gradients/glows | `linear` | 5000ms+ |

## 3. Prohibited Motion
- Hover scaling on buttons > 1.02x.
- Parallax scrolling on main content pages (distracts from data).
- "Jelly" or elastic UI components.
- Staggered entrances that take longer than 500ms to complete for a whole list.

## 4. Live Experience Choreography
When race data rapidly shifts (e.g., Red Flag, VSC, Yellow Flag):
- The motion must **calm down**, not speed up. 
- A Yellow Flag triggers a pulse of the UI header, then settles into a static warning state.
- Focus the user's eye via contrast, not via continuous animation.

## 5. Mobile & GPU Budgets
- Limit `will-change: transform` or `opacity` to active elements only.
- Remove animations from off-screen components (via IntersectionObserver).
- Respect `prefers-reduced-motion: reduce` OS settings globally by defaulting to 0ms durations.
