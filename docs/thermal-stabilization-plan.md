# APEX F1 — Thermal Stabilization Plan

**Platform: MacBook Air M4 — Fanless, thermal-throttles aggressively under sustained load.**

---

## Root Causes (Phase 1)

| System | Thermal Impact | Status |
|---|---|---|
| `SceneCanvas` — fixed WebGL canvas `dpr=[1,2]`, running at all times | 🔴 HIGH — continuous GPU work even on text pages | ✅ Deleted Day 1 |
| `AudioEngine` — Howler startup + ambient loop attempt on every page | 🟡 MEDIUM — audio context + failed network requests on mount | ✅ Deleted Day 1 |
| `CinematicTrackMap` — infinite SVG stroke-dashoffset animation (`8s linear infinite`) | 🟡 MEDIUM — CSS animation running continuously | ✅ Deleted Day 1 |
| `OrchestrationContext` — global `setTimeout` chains triggering re-renders across all consumers | 🟡 MEDIUM — O(consumers) re-renders on every step change | ✅ Deleted Day 1 |
| `TelemetryHUD` — `AnimatePresence` on every orchestration step, Framer Motion layout recalculation | 🟡 LOW-MEDIUM | ✅ Deleted Day 1 |
| `MissionControlHUD` — `Math.random()` in render, `animate-pulse` on timing indicator | 🟡 LOW-MEDIUM | ✅ Deleted Day 1 |
| Running Docker + Next.js + FastAPI simultaneously | 🔴 HIGH — 3 runtimes, 3 file watchers, 3 transpilers | 🔵 Process rule |

---

## Workload Distribution Rules

### MacBook Air (Local)
**Runs:** Next.js dev server only
```bash
cd apps/web && pnpm dev
```

**Never runs locally:**
- Docker / docker-compose
- FastAPI (`uvicorn`)
- ML training (`python ml/train.py`)
- Data ingestion (`python ingestion/ingest.py`)
- Alembic migrations

### GitHub Codespaces (Remote)
**Runs:**
- FastAPI development server
- Data ingestion pipeline
- ML training and evaluation
- Alembic migrations
- Database integrity audit

---

## Dev Process Rules

### File Watcher Optimization (Already in `next.config.ts`)
The following paths are excluded from Next.js webpack watcher:
- `**/node_modules/**`
- `**/public/models/**` (3D models)
- `**/*.pkl` (ML artifacts)
- `**/ingestion.log`
- `**/scratch/**`
- `**/tests/**`

This prevents webpack from rebuilding when binary/ML files change — a primary cause of infinite rebuild storms.

### Tailwind Watcher
Tailwind v4 uses lightning-fast Rust-based compilation. No additional optimization needed.

### tsserver Load
Keep TypeScript strict mode but limit `include` in `tsconfig.json` to `apps/web/**` only. Do not include `apps/api` or `scratch/` in the web tsconfig paths.

---

## R3F Canvas Rules (When Re-Introduced)

All Canvas elements **must** follow these rules, enforced in code review:

```tsx
// ✅ CORRECT — thermal-safe Canvas config
<Canvas
  frameloop="demand"        // Only renders on state change, not continuously
  dpr={[1, 1.5]}            // Max 1.5x pixel ratio. Never [1, 2].
  gl={{
    antialias: true,
    alpha: false,            // false = no compositing overhead
    powerPreference: "default",  // NOT "high-performance" — avoids discrete GPU
    stencil: false,
    depth: true,
  }}
>

// ❌ BANNED — causes constant GPU load
<Canvas
  frameloop="always"        // Renders at 60fps regardless of changes
  dpr={[1, 2]}              // Forces 2x on Retina = 4x pixel work
  gl={{ powerPreference: "high-performance" }}  // Forces discrete GPU
>
```

### Canvas Mounting Strategy
```tsx
// ✅ Mount Canvas only when in viewport
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

const Car3D = dynamic(() => import("@/components/Car3D"), { ssr: false });

function CarSection() {
  const { ref, inView } = useInView({ triggerOnce: true });
  return (
    <div ref={ref} style={{ height: 400 }}>
      {inView && <Car3D />}
    </div>
  );
}
```

---

## Memory Leak Prevention

| Pattern | Risk | Mitigation |
|---|---|---|
| `setInterval` without cleanup | High | Always return `() => clearInterval(id)` from `useEffect` |
| Event listeners without removal | High | Use `addEventListener` / `removeEventListener` symmetrically |
| R3F resources without disposal | Medium | Dispose geometry + materials in `useEffect` cleanup |
| Howler instances | High | Deleted — was calling `new Howl()` without `unload()` on page change |
| Stale closures in `useEffect` | Medium | Include all dependencies in deps array |

---

## Monitoring

- **Thermal:** Activity Monitor → GPU History. Should be flat on non-3D pages.
- **Memory:** Chrome DevTools → Memory → Take Heap Snapshot. Compare pre/post navigation.
- **Re-renders:** React DevTools Profiler. No component should re-render without a prop/state change.
- **Bundle:** `pnpm build:analyze` → Check Three.js is not in initial bundle.
