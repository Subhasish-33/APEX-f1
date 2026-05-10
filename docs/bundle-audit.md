# APEX F1 — Bundle Audit

**Phase 2 Day 1 — Based on `apps/web/package.json` analysis.**

---

## Current Bundle Composition (Estimated)

| Package | Gzipped Size | Load Strategy | Status |
|---|---|---|---|
| `next` (framework) | ~95KB | Always | ✅ Required |
| `react` + `react-dom` | ~45KB | Always | ✅ Required |
| `three` | ~580KB | Route-level | ⚠️ Must be dynamic |
| `@react-three/fiber` | ~120KB | Route-level | ⚠️ Must be dynamic |
| `@react-three/drei` | ~200KB | Route-level | ⚠️ Must be dynamic |
| `@react-three/postprocessing` | ~80KB | Was always loaded | ✅ REMOVED Day 1 |
| `framer-motion` | ~120KB | Conditional | ⚠️ Audit use sites |
| `recharts` | ~300KB | Chart routes | ⚠️ Must be dynamic |
| `howler` | ~50KB | Never used | ✅ REMOVED Day 1 |
| `lucide-react` | Tree-shaken | Always | ✅ OK |
| `react-intersection-observer` | ~5KB | Always | ✅ OK |
| `@vercel/analytics` | ~8KB | Always | ✅ Required |

**Estimated pre-Day-1 homepage bundle:** ~600–800KB gzipped (Three.js + Recharts loading synchronously via global imports in deleted components)

**Estimated post-Day-1 homepage bundle:** ~150–200KB gzipped (framework + framer-motion + lucide + analytics only)

**Target:** ≤ 200KB gzipped on homepage ✅

---

## Actions Taken (Day 1)

### Removed from `package.json`
- `howler` (50KB) — no audio assets exist
- `@types/howler` (dev only) — removed with howler
- `@react-three/postprocessing` (80KB) — CarViewer3D deleted

### Made Dynamic (Dynamic Import, ssr: false)
- `recharts` — HistoryChart, PointsChart, PositionTrace (all chart routes)

### Root Layout Cleaned
- Removed `SceneCanvas` global import (was loading Three.js on every page)
- Removed `AudioEngine` (was loading Howler on every page)
- Removed `OmniSearchCortex` (11KB client component on every page)

---

## Remaining Concerns

### `framer-motion` (~120KB)
**Current usage after Day 1:**
- `components/Navbar.tsx` — dropdown animation (replaced with CSS transitions Day 1)
- `components/Race/PositionTrace.tsx` — import removed Day 1
- Any remaining usage in `TeamDetailClient.tsx` and other components

**Action:** Audit all remaining `import { motion } from "framer-motion"` in Day 2. If usage drops below 3 components, consider removing entirely.

### `three` + R3F (~900KB combined)
**Current usage after Day 1:**
- No components use Three.js after CarViewer3D and Car3D deletion
- Packages remain in `package.json` for future Phase 2 car visualization (procedural fallback)
- When re-introduced: **must** be `next/dynamic({ ssr: false })` with `frameloop="demand"`

**Action:** Run `pnpm build:analyze` to confirm Three.js is NOT in the homepage bundle.

---

## Bundle Budget Enforcement

```json
// .github/lighthouse-budget.json
{
  "resourceSizes": [
    { "resourceType": "script", "budget": 300 }
  ]
}
```

**Run bundle analyzer:**
```bash
cd apps/web
pnpm build:analyze
```

This opens a visualization of the bundle at `http://localhost:8888`.

---

## Image Policy

| Asset Type | Format | Max Size | Delivery |
|---|---|---|---|
| Driver headshots | WebP | 40KB | `next/image` |
| Team logos | SVG | — | `next/image` or inline |
| Car liveries | PNG/WebP | 80KB | `next/image` |
| Track maps | SVG | — | Inline or static import |
| OG images | WebP | 120KB | Static branded image |

**Rules:**
- All images served through `next/image` (automatic format optimization)
- No raw `<img>` tags in production code
- No base64 embedded images
