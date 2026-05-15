# APEX Media Performance Policy
# Tier 5 / Phase 1 — Deterministic Media Infrastructure

## Mandate

The media layer must be **cinematic without becoming slow.**
Every constraint in this document is non-negotiable and applies to all
environments (development, staging, production).

---

## 1. Image Size Budgets

| Context          | Variant    | Max File Size | Max Resolution | Format Priority |
| ---------------- | ---------- | ------------- | -------------- | --------------- |
| Hero (desktop)   | `cinematic`| 300 KB        | 1920×1080      | AVIF → WebP     |
| Hero (mobile)    | `mobile`   | 120 KB        | 390×260        | AVIF → WebP     |
| Driver card      | `card`     | 80 KB         | 400×300        | WebP            |
| Driver headshot  | `hero`     | 150 KB        | 1200×800       | AVIF → WebP     |
| Editorial thumb  | `thumbnail`| 30 KB         | 120×120        | WebP            |
| HiDPI (retina)   | `retina`   | 500 KB        | 2400×1600      | AVIF → WebP     |
| LQIP placeholder | `blur`     | < 1 KB        | 20px wide      | WebP quality=15 |

> **Rule**: Exceeding the budget for any variant is a pipeline failure.
> The generate_variants.py script must enforce these budgets at build time.

---

## 2. Format Requirements

### WebP
- **Required** for all variants in all browsers.
- Minimum quality: 80 (hero), 82 (card), 85 (thumbnail).
- Maximum quality: 90 — no diminishing returns above this.
- `webp_available` must be `true` before `is_production_safe` can be set.

### AVIF
- **Preferred** — served when browser supports it.
- Quality target: 70 (AVIF compresses 30–50% better than WebP at similar perceptual quality).
- `avif_available` is optional in Phase 1 but required before Phase 3 (Cinematic Experience).
- Use `pillow-avif-plugin` or `libvips` for generation.

### SVG (Logos & Maps)
- Team logos: SVG only. No raster fallback required (CSS color fallback is sufficient).
- Circuit maps: SVG only. Generated from OSM geometry by APEX custom renderer.
- No SVG from external sources may contain `<script>` tags or external `href`.
- All SVGs must pass `svgo` optimization before storage.

### PNG
- Allowed only for driver headshots requiring transparency (alpha channel).
- Must be converted to WebP with alpha channel preserved.
- `has_transparency` must be set correctly by verify_media.py.

---

## 3. LCP (Largest Contentful Paint) Budget

| Page Type           | LCP Budget | Strategy                                      |
| ------------------- | ---------- | --------------------------------------------- |
| Homepage hero       | ≤ 2.5s     | `<link rel="preload">` for cinematic variant  |
| Driver profile      | ≤ 2.0s     | LQIP blur → hero transition                   |
| Race calendar page  | ≤ 2.5s     | Lazy load all thumbnails below fold           |
| Live cockpit        | ≤ 1.5s     | No hero images — data only                    |
| News/editorial page | ≤ 2.5s     | Article hero preloaded                        |

---

## 4. Preload Governance

Only preload assets that are **above the fold** and **critical to LCP**.

### Allowed Preloads
- Homepage `cinematic` variant of the current race weekend hero
- Active driver profile `hero` variant (when user navigates to driver page)
- Race thumbnail for the next race (in race hub strip)

### Forbidden Preloads
- All news thumbnails
- Driver headshots in grid views (lazy load these)
- Team logos (small, fast — no preload needed)
- Any asset below the fold at page load

---

## 5. Lazy Loading Rules

- All images below the fold: `loading="lazy"`.
- All images in lists/grids (driver grid, race calendar): `loading="lazy"`.
- Hero images: `loading="eager"` with explicit `fetchpriority="high"`.
- LQIP blur variants: rendered inline as CSS `background-image` — no lazy load.

---

## 6. Zero CLS (Cumulative Layout Shift) Requirements

CLS **must be zero** for all image containers.

### How
- **Always** set `width` and `height` attributes from the DB `width`/`height` fields.
- **Always** reserve space using `aspect_ratio` before the image loads.
- **Never** use `width: 100%` without an `aspect-ratio` CSS property.
- **Always** render the LQIP blur variant as the container background before the full image.

### Implementation
The frontend `ApexImage` component (Phase 3) will:
1. Read `width`, `height`, `aspect_ratio` from the media resolver response
2. Set container `style="aspect-ratio: {width}/{height}"`
3. Render `blurhash` as base64 inline CSS background
4. Swap to `cdn_url` on load

If `width` or `height` is null in the API response, the frontend must use
the variant's known dimensions from the `variants` manifest.

---

## 7. Video Usage Policy

- Video is only permitted on the homepage hero section.
- Source: `/videos/hero.mp4` (self-hosted, not external CDN).
- Max file size: 8 MB for the full-quality version.
- Must have a poster image (the `cinematic` variant of the current race).
- `autoPlay`, `muted`, `loop`, `playsInline` are required attributes.
- On mobile: video should be replaced by a static `mobile` variant image.
- No video on driver pages, team pages, or news pages in Phase 1 or 2.

---

## 8. Animation Budget

> No animation budget applies to Phase 1.
> This section governs Phase 3 (Cinematic Experience).

Phase 3 constraints (defined now, enforced later):
- No animation may cause CLS.
- All CSS transitions: `transform` and `opacity` only (GPU-composited).
- No `height` or `width` animations.
- Reduce-motion media query must disable all non-essential animations.
- Max animation duration: 400ms for UI interactions, 800ms for page transitions.

---

## 9. Cache TTL Policy

| Asset Type            | CDN Cache TTL | Browser Cache |
| --------------------- | ------------- | ------------- |
| Active optimized asset| 1 year        | 30 days       |
| Fallback placeholder  | 1 hour        | 5 minutes     |
| Degraded asset        | 5 minutes     | No cache      |
| Registry status API   | 30 seconds    | No cache      |
| Media resolver API    | 5 minutes     | No cache      |

- CDN cache invalidation must be triggered by `optimization_version` bump.
- Assets with `is_production_safe=False` must be served with `Cache-Control: no-cache`.

---

## 10. Enforcement

These budgets are enforced by:
- `generate_variants.py` — rejects variants exceeding size budgets
- `audit_media.py` — blocks clearance without WebP availability
- `audit_media_ops.py` — reports optimization coverage percentages
- Frontend `ApexImage` component — refuses to render without `width`/`height`
