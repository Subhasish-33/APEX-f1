# APEX-F1 Experience Governance
# Tier 5 / Phase 3 — Cinematic Editorial Experience

## Purpose
This document enforces the hard boundaries for the Cinematic Editorial Experience. Without these boundaries, visual ambition will lead to performance collapse and UX entropy.

## 1. Interaction Density Rules
- The user must never be forced to process more than **two** rapidly updating telemetry tables at once.
- The Progressive Depth Architecture ensures that:
  - **Layer 1 (Casual)**: Top-level standings, interval to leader. Max 1 update/sec.
  - **Layer 2 (Enthusiast)**: Pit windows, tire ages. Max 2 updates/sec.
  - **Layer 3 (Deep Telemetry)**: Microsectors, pace traces. Slower, smoother polling. 
- "Hidden" interactions (like horizontal swipes on desktop) are forbidden. All data states must have a visible toggle or button.

## 2. Accessibility & Cognitive Load
- Contrast ratios must pass WCAG AA for all typography (especially crucial on dark modes with translucent backgrounds).
- Semantic HTML tags (`<article>`, `<section>`, `<time>`) must be used for layout, not just `<div>` soup.
- Live data must not abruptly shift layout elements (Zero CLS rule extended to typography, using tabular numbers).

## 3. Motion & GPU Budgets
- **DOM Node Limit**: No single view should exceed 1,500 DOM nodes.
- **Concurrent Animations**: Maximum of 3 distinct, continuous CSS animations per viewport (e.g., TEAM_COLOR_GLOW, track scan, live-indicator pulse).
- **GPU Layers**: Use `will-change` sparingly. Only applied to actively transitioning components, removed upon completion.

## 4. Typography Rules
- Use tabular numerals (`font-variant-numeric: tabular-nums`) for all timing data.
- Cap line lengths for editorial prose at ~75 characters to preserve readability.
- Max 3 font weights per view to reduce payload and visual clutter.

## 5. Atmosphere Limits
- Blur effects (`backdrop-filter: blur`) are notoriously expensive on mobile GPUs. 
- Limit active backdrop filters to Sticky Headers and Modal Overlays. Do NOT apply backdrop-filter to individual data cards inside a grid.
- `box-shadow` glows should use solid colors with low opacity, not complex multi-layered blurs.
