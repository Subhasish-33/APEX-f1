# APEX Media Composition Rules
# Tier 5 / Phase 1 — Deterministic Media Infrastructure

## Mandate

The secret behind premium motorsport presentation is **composition consistency**, not heavy effects.
These rules define the visual grammar that makes APEX look premium even before a single glow or
animation is added. Phase 1 must enforce these compositional standards in the data pipeline so that
Phase 3 can build upon a disciplined foundation.

---

## 1. Safe Text Zones

Every asset must have a defined **safe text zone** — the area where UI text (name, position, badge)
can be placed without illegibility.

### Driver Headshots (HEADSHOT category)
```
┌─────────────────────┐
│   UNSAFE ZONE       │  ← Top 15% — helmet/halo area
│   (no text here)    │
├─────────────────────┤
│                     │
│   DRIVER BODY       │
│   (image subject)   │
│                     │
├─────────────────────┤
│   SAFE TEXT ZONE    │  ← Bottom 35% — dark background or gradient overlay
│   Name / Number     │
└─────────────────────┘
```

- Text overlay gradient must be applied in CSS, not baked into the image.
- The bottom safe zone requires a minimum contrast ratio of 4.5:1 (WCAG AA).
- `focal_point.y` should be set to ≤ 0.4 for headshots (driver face in upper half).

### Team Logos (LOGO category)
- Logos must have a minimum clear-space equal to the cap height of the smallest letter in the mark.
- Never overlay text directly on a team logo.
- Logo containers must preserve the logo's `aspect_ratio` — no distortion.
- Minimum logo size in UI: 24×24px. Maximum for cards: 120×48px.

### Circuit Maps (MAP category)
- Track layout occupies the **center 80%** of the canvas.
- Outer 10% on each side is always transparent or same-color background.
- No sector color coding in Phase 1 — single-color track outline only.
- Track stroke width: 3px at 400px canvas, scaled proportionally.

### Car Renders (CAR_RENDER category)
- Car must be positioned with **right-facing orientation** (standard side profile).
- Safe zone for team name/chassis text: **above the car** or **bottom 20%**.
- Car must not be cropped at the front or rear in any variant.
- `focal_point.x` should be 0.5 (car centered horizontally).
- `focal_point.y` should be 0.6 (car body in lower-center of frame).

---

## 2. Focal Point Rules

Every asset stored in the registry **must** have a `focal_point` value set by verify_media.py
or overridden by the ingestion manifest.

### Focal Point Defaults by Category

| Category      | Default focal_point     | Rationale                           |
| ------------- | ----------------------- | ----------------------------------- |
| HEADSHOT      | `{"x": 0.5, "y": 0.3}` | Face in upper third                 |
| HERO          | `{"x": 0.45, "y": 0.4}`| Cockpit/helmet zone                 |
| LOGO          | `{"x": 0.5, "y": 0.5}` | Center — logos are symmetric        |
| CAR_RENDER    | `{"x": 0.5, "y": 0.6}` | Car body center                     |
| HELMET        | `{"x": 0.5, "y": 0.45}`| Visor zone                          |
| MAP           | `{"x": 0.5, "y": 0.5}` | Track center                        |
| FLAG          | `{"x": 0.5, "y": 0.5}` | Center — flags are symmetric        |
| THUMBNAIL     | `{"x": 0.5, "y": 0.4}` | Action zone                         |
| ARTICLE_HERO  | `{"x": 0.5, "y": 0.45}`| Subject in upper-center             |

The `generate_variants.py` script uses focal_point for all crop operations.
A wrong focal_point = cropped face = broken UI. This must be validated before clearance.

---

## 3. Driver Eye-Line Positioning

This is one of the most critical rules for premium motorsport photography.

### The APEX Eye-Line Standard
- In `HEADSHOT` variants, the **driver's eyes must appear in the top 40%** of the frame.
- In `thumbnail` variant (120×120), the **helmet visor must be visible**.
- In `hero` variant (1200×800), the driver must be **left-aligned** (x: 0.35)
  to leave right half open for text overlays.
- **Never** crop at the eye level or chin level.

### Compliance
- Verified manually by reviewing the `blur` variant after generation.
- Focal point is adjusted until the driver's visor appears correctly.
- `audit_media.py` does not enforce this automatically — it is a human-review step.

---

## 4. Logo Scaling Rules

| Context              | Logo Size   | Background Requirement          |
| -------------------- | ----------- | ------------------------------- |
| Navbar dropdown      | 24×24px     | No background — transparent     |
| Team card header     | 32px height | Team primary color background   |
| Team profile hero    | 80px height | Dark background with clearspace |
| Standings table      | 20px height | No background                   |
| Mega menu            | 48px height | Semi-transparent dark panel     |

- Logos must **never** be lighter than 40% opacity in any context.
- In dark contexts: use the light variant of the logo if available.
- In light contexts: use the dark variant.
- Monochrome logos: apply team primary color at 100% opacity.

---

## 5. Crop Ratios by Variant

| Variant     | Ratio  | Notes                                    |
| ----------- | ------ | ---------------------------------------- |
| thumbnail   | 1:1    | Square — centered on focal point         |
| card        | 4:3    | Standard editorial card ratio            |
| hero        | 3:2    | Primary profile image                    |
| mobile      | 3:2    | Same ratio as hero, smaller resolution   |
| retina      | 3:2    | 2× of hero                               |
| cinematic   | 16:9   | Full-bleed homepage hero                 |
| blur        | same as hero | Low-resolution LQIP — ratio preserved |

---

## 6. Hero Alignment Standards

### Homepage Hero
- Subject (car/action) in **left 40%** of the frame.
- Right 60%: text/overlay zone (gradient from right to left).
- No key visual elements in the center or right 40%.

### Driver Profile Hero
- Subject (driver in cockpit or on podium) in **left 35%**.
- Space for driver name (large display type) in right 60%.
- Sky or abstract background in upper portion.

### Team Profile Hero
- Car render or garage shot.
- Team logo centered in upper third.
- Car occupies lower 60% of the frame.

---

## 7. Overlay Governance

Phase 1: No overlays are baked into images.
All text, gradients, and color overlays are applied in CSS/React.

### Permitted CSS overlays (defined now, applied in Phase 3)
- **Linear gradient** over hero images: `rgba(0,0,0,0.7)` left → `rgba(0,0,0,0)` right
- **Team color glow**: box-shadow using `dominant_palette.vibrant` at 30% opacity
- **Vignette**: `radial-gradient(circle, transparent 50%, rgba(0,0,0,0.6) 100%)`

### Forbidden
- Gaussian blur applied to full hero images (use blur variant for LQIP only)
- Saturation filters that alter the original image color profile
- Text rendered directly onto images by the pipeline

---

## 8. Editorial Spacing

These are minimum padding rules for media containers in editorial layouts.
They ensure visual rhythm and prevent media from touching adjacent elements.

| Container         | Min padding | Notes                                  |
| ----------------- | ----------- | -------------------------------------- |
| Hero section      | 0 (bleed)   | True full-bleed — no padding           |
| Driver card       | 16px        | Minimum internal padding               |
| News thumbnail    | 0           | Card container handles spacing         |
| Standing row logo | 8px each side | Optically balanced with row height   |
| Team profile logo | 24px        | Clear space enforced by CSS            |

---

## 9. Optical Balancing Rules

These rules ensure assets feel visually balanced when placed alongside text or data.

1. **Weight balance**: A large image on the left requires equivalent typographic weight on the right.
2. **Team color echo**: The dominant_palette.vibrant color must appear at least once in the
   surrounding UI (border, badge, underline) to create visual continuity.
3. **Whitespace as structure**: Never place two assets side-by-side without at least 16px gap.
4. **Grid alignment**: All images must align to the 8px baseline grid.
5. **No floating images**: Every image must be contained within a defined layout region.

---

## 10. Phase 3 Composition Restrictions (Preview)

These are locked now and will be implemented in Phase 3:

- Parallax effect: max 20px vertical translation — no more.
- Driver "cut-out" effect: requires `has_transparency=True` in the registry.
- Animated team color glow: uses `dominant_palette.vibrant` with 400ms ease-in-out.
- Cinematic grain texture: APEX proprietary SVG filter — not applied to images, only to overlay divs.
