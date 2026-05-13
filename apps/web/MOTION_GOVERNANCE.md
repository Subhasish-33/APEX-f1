# APEX-F1 — Motion Governance

**Status: Phase 2 Frozen**

## Principles of Purposeful Motion
Motion in APEX-F1 must be subtle, performant, and informative. We avoid "cinematic overengineering" to protect device thermals and accessibility.

---

## 1. Forbidden Patterns
- **Full Page Animations**: Never animate the entire page opacity or position on route change.
- **Stacked Transforms**: Avoid animating `rotate`, `scale`, and `translate` simultaneously on heavy elements.
- **Blur-Heavy Transitions**: CSS `backdrop-filter` and `filter: blur()` animations are expensive and must be used sparingly.
- **Infinite Animations**: No infinite loops (e.g., pulsing backgrounds) on static content.
- **Layout Animations**: Avoid Framer Motion's `layout` prop on large lists or complex trees.

---

## 2. Allowed Patterns
- **Opacity**: Fade-ins for content reveal.
- **Subtle translateY**: 4px to 10px vertical shifts on entry.
- **Hover Transitions**: Standard `transition-ui` for buttons, cards, and links.
- **Telemetry Pulse**: Micro-animations for live data updates (max 1s duration, non-looping).

---

## 3. Implementation Rules
- Use the CSS variables `--ease-out` and `--duration-standard` for all manual CSS transitions.
- For Framer Motion, use the `TOKENS.motion.easing` values.
- **Reduced Motion**: Always respect the `prefers-reduced-motion` media query. `globals.css` handles this globally, but custom animations must verify compliance.
- **Visibility**: Only animate elements that are in the viewport (use `IntersectionObserver`).
