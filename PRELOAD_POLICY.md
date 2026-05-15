# APEX Preload Policy
# Tier 5 / Phase 2 — Delivery Intelligence

## Mandate

Preloading too many assets is worse than preloading none.
Uncontrolled preloads steal bandwidth from the LCP asset and cause
bandwidth congestion on constrained networks.

This document defines the exact preload strategy for every page context on APEX.
The `PreloadGovernor` class in `apps/api/media_runtime/preload_governor.py`
enforces these rules programmatically.

---

## 1. Preload Budget by Route

| Route                | Max Preloads | Asset to Preload           | Rationale              |
| -------------------- | ------------ | -------------------------- | ---------------------- |
| `/`                  | 1            | Homepage cinematic hero    | LCP asset              |
| `/drivers`           | 0            | None                       | Grid — lazy load all   |
| `/drivers/[ref]`     | 1            | Driver hero variant        | Profile LCP            |
| `/teams`             | 0            | None                       | Grid — lazy load all   |
| `/teams/[ref]`       | 1            | Team hero/car render       | Profile LCP            |
| `/races`             | 0            | None                       | Calendar thumbnails    |
| `/races/[ref]`       | 1            | Race thumbnail/hero        | Race hub LCP           |
| `/standings`         | 0            | None                       | Data-first page        |
| `/news`              | 0            | None                       | Lazy load news cards   |
| `/news/[slug]`       | 1            | Article hero               | Article LCP            |
| `/live`              | 0            | None                       | Data only — no images  |

**Total maximum preloads per request: 1.**

---

## 2. Eligibility Rules

A preload hint is only emitted when ALL of the following are true:

1. **Context is above-fold**: Only `profile_hero`, `full_bleed`, `news_hero`, `team_header`.
2. **Route budget not exhausted**: First preload wins — subsequent assets skip.
3. **Not mobile**: Mobile devices receive zero preloads (see mobile policy below).
4. **Not save-data**: If `Save-Data: on` header is present, no preloads ever.
5. **URL is a valid CDN URL**: Data URIs and local paths are never preloaded.
6. **Not a duplicate**: Same URL cannot be preloaded twice per request.

---

## 3. Mobile Preload Policy

**Default: No preloads on mobile.**

Reasoning:
- Mobile devices are frequently on constrained networks (3G, 4G LTE at poor signal).
- Preloading a hero image on mobile competes directly with the main document fetch.
- The LQIP blur data URI renders immediately from CSS — no preload needed.

**Exception (Race Weekend Override):**
- On race day, the PreloadGovernor accepts `race_weekend=True`.
- This enables preloading the race-weekend cinematic hero on mobile WiFi.
- This is a manual flag set by the platform operations team.

---

## 4. Format Preload Preference

When emitting `<link rel="preload">`:

```html
<!-- Preferred: AVIF with WebP fallback -->
<link
  rel="preload"
  as="image"
  href="{avif_url}"
  type="image/avif"
  imagesrcset="{srcset}"
  fetchpriority="high"
/>

<!-- Fallback: WebP only -->
<link
  rel="preload"
  as="image"
  href="{webp_url}"
  type="image/webp"
  imagesrcset="{srcset}"
  fetchpriority="high"
/>
```

Use `imagesrcset` for responsive preloads.
Always include `fetchpriority="high"` — the preloaded asset IS the LCP asset.

---

## 5. Preload Anti-Patterns (Forbidden)

The following preloads are **explicitly prohibited**:

| Anti-Pattern | Why Forbidden |
|---|---|
| Preloading thumbnail grids | Wastes bandwidth — these are below fold |
| Preloading team logos | Tiny files — browser fetches faster than preload helps |
| Preloading blur/LQIP variants | These are inline data URIs — no network request needed |
| Multiple preloads per page | Kills bandwidth for real LCP asset |
| Preloading on `/live` route | Live timing is pure data — zero image preloads |
| Preloading retina on mobile | 2400px variant on a 390px screen — wasteful |

---

## 6. Duplicate Prevention

The `PreloadGovernor` maintains a per-request set of preloaded URLs.
If the same CDN URL is encountered twice (e.g., same driver appears in list + profile),
the second preload is silently skipped.

This prevents preload chaos when pages contain the same asset in multiple contexts.

---

## 7. Race-Weekend Mode

During active race weekends, the platform may enter race-weekend mode:
- Homepage hero is updated more frequently (race session images).
- Cache TTL drops to `TIER_RACE_WEEKEND` (30 min).
- One mobile preload is permitted for the race hero (WiFi assumption).
- Preload governor `race_weekend=True` must be set by the sync pipeline.

This is a deliberate operational override — NOT the default state.

---

## 8. Implementation

**Backend (API):**
```python
# In the media route, after building envelopes:
from media_runtime.preload_governor import PreloadGovernor, build_preload_hints

governor = PreloadGovernor(mobile=is_mobile, race_weekend=is_race_weekend)
for envelope in envelopes:
    can = governor.can_preload(route, context, url=envelope["delivery"]["url"])
    envelope["delivery"]["preload"] = can

hints = build_preload_hints(envelopes)
# Return hints in response headers or as JSON for Next.js <Head>
```

**Frontend (Next.js):**
```tsx
// In page components — use preload hints from API response
{preloadHints.map(hint => (
  <link
    key={hint.url}
    rel="preload"
    as="image"
    href={hint.url}
    type={hint.type}
    fetchPriority="high"
  />
))}
```

---

## 9. LCP Budget Targets (from MEDIA_PERFORMANCE_POLICY.md)

| Page | LCP Budget | Preload Strategy |
|------|-----------|-----------------|
| Homepage | ≤ 2.5s | Preload cinematic hero |
| Driver profile | ≤ 2.0s | Preload hero variant |
| Race hub | ≤ 2.5s | Preload race thumbnail |
| News article | ≤ 2.5s | Preload article hero |
| Live timing | ≤ 1.5s | No image preloads |

The preload governor is the enforcement mechanism for these LCP targets.
If LCP regressions are detected in observability, tighten these budgets here.
