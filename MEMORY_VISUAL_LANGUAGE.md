# APEX-F1 Memory Visual Language
# Tier 5.5 — The Legacy Layer

## Purpose
Historical experiences in APEX-F1 must feel fundamentally distinct from live telemetry experiences. Live telemetry is sharp, immediate, and high-contrast. The Memory Layer is cinematic, reflective, and textured.

## 1. Cinematic Textures
We introduce physical artifacts to digital memories to create emotional weight.
*   **Film Grain**: A subtle, dynamically generated SVG or CSS noise filter is applied over `MemorySurface` hero images. It creates the illusion of archival preservation.
*   **Vignetting**: Deep, soft vignettes anchor the focal points, dimming the edges of the screen to focus cognitive attention entirely on the narrative.

## 2. Archival Typography
*   **Analog Serifs & Wide Sans**: While live data relies strictly on `tabular-nums` and monospace, memory prose uses wider-tracked sans-serifs or sophisticated serifs for blockquotes and narrative text.
*   **Pacing & Fade-Ins**: Text does not snap into existence. It fades in slowly. A memory takes time to recall.

## 3. The Color Grading System (Taxonomy-Driven)
The `MemoryClassification` directly dictates the CSS color grading overlay.
*   **LEGENDARY**: `grade-warm-gold` — Elevated, warm mid-tones, heroic.
*   **TRAGIC**: `grade-desaturated-blue` — Cold, stark, drained of saturation.
*   **DOMINANT**: `grade-cold-steel` — High contrast, sharp whites, deep blacks. Unemotional.
*   **REDEMPTIVE**: `grade-sunrise` — Gradual warm gradients breaking through dark shadows.
*   **CHAOTIC**: `grade-high-contrast` — Unforgiving contrast, blown-out highlights.

## 4. Motion Restraint
*   **Cinematic Stillness**: Avoid fast pans or zooms on historical images. The user should be able to stare at the moment in peace.
*   **Transition Speeds**: Transitions between memory states or scrolling through a Driver Mythology timeline should use eased, elongated durations (e.g., `800ms ease-out` rather than `200ms linear`).

## 5. Prohibited Elements
*   **No Flashy Retrospectives**: No rapid "hype montages."
*   **No Overediting**: Do not overlay neon glitch effects or digital artifacts on historical moments.
*   **No Telemetry Overload**: If telemetry is shown from a past race, it is simplified. Only the essential delta or speed trace is shown, abstracted into a beautiful curve rather than a dense grid of numbers.
