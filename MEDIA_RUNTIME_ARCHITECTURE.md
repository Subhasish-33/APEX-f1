# APEX-F1 Media Runtime Architecture
# Tier 5 / Phase 3 — Cinematic Editorial Experience

## Purpose
This document captures the final operational architecture of the APEX-F1 Media Delivery Engine. It prevents operational entropy as the system scales into cinematic production.

---

## 1. Request Lifecycle & Orchestration

The media resolution flow acts as a funnel from the backend database state down to the client's screen.

1. **Frontend Request**: The `EliteImage` React component uses the generic `useEliteImageRuntime` hook to load an image, passing an envelope (or a raw URL which converts to a minimal envelope).
2. **API Resolution**: `/api/routes/media.py` builds the `request_context` (viewport, dpr, accept-header).
3. **Service Layer**: `services/media.py` checks for `budget_ok=False`. If a budget is blown, `is_production_safe` becomes `False`.
4. **Delivery Orchestrator**: Uses the context and asset metadata to build a `DeliveryEnvelope`.

---

## 2. Negotiation Flow (`variant_negotiator.py`)

Negotiation takes 5 dimensions and returns exactly 1 variant and its AVIF/WebP URLs:

- **Dimension 1**: Viewport Class (`mobile`, `tablet`, `desktop`)
- **Dimension 2**: Device Pixel Ratio (1x, 2x, 3x) -> *2x Mobile gets Hero, not Mobile*
- **Dimension 3**: Format -> Parses the HTTP `Accept` header for `image/avif`.
- **Dimension 4**: Context -> Lookups up priority lists (`profile_hero`, `card_grid`, etc).
- **Dimension 5**: Save-Data -> If `true`, bypasses all logic and returns `thumbnail`.

---

## 3. Preload Flow (`preload_governor.py`)

A single `PreloadGovernor` instance is scoped to the request context.

- **Rule 1: Mobile Suppression**: Zero preloads on mobile unless `race_weekend=True`.
- **Rule 2: Context Eligible**: Only contexts like `profile_hero` or `full_bleed` allow preloads.
- **Rule 3: Route Budget**: Routes have a hard budget. Home = 1, Driver Profile = 1, Lists = 0.
- **Rule 4: Deduplication**: `governor` tracks preloaded URLs per-request. No duplicate preloads.

---

## 4. Cache Flow (`media_cache_manager.py`)

Cache tiers are adaptive and deterministic.

| Tier | Condition | TTL | SWR | Notes |
|------|-----------|-----|-----|-------|
| `IMMUTABLE` | Active + Versioned | 1 yr | 0 | Ideal for CDN caching |
| `LONG` | Logos / Active Defaults | 7 d | 1 d | High cache-hit |
| `ADAPTIVE_SPIKE` | Load = high | 60 s | 30 s | Prevents DB collapse |
| `BREAKING_NEWS` | Context = news | 120s | 60 s | Fast freshness |
| `RACE_WEEKEND` | Race flag = True | 30 m | 120s | Session updates |

---

## 5. Delivery Orchestration & Fallback Logic

### Frontend Fallback Strategy (EliteImage V2)

1. **Data URI (0ms)**: Renders base64 LQIP on hydration via CSS.
2. **AVIF (Network)**: Tries `avif_url` if the browser negotiated it.
3. **WebP (Network)**: Tries `url` if AVIF fails.
4. **Fallback Chain (Network)**: Client walks the `runtime_fallback_chain` from highest variant downward. Max 3 attempts enforced by `EliteImageRuntime.ts` failure budgeting.
5. **CSS Descriptor (0ms)**: If all URLs exhaust, a deterministic CSS fallback is rendered (e.g. `TEAM_COLOR_GLOW`).

---

## 6. Observability

All client-side failures emit `apex:media:fallback` or `apex:media:incident` custom events.
These are collected and POSTed to `/api/media/observe`.
Logs are pushed into the operational stream for `audit_media_ops.py` to identify pipeline degradation.
