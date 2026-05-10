# APEX F1 — Repo Audit

**Generated:** Phase 2 Day 1 — Full codebase inspection.

---

## KEEP — Production-Worthy, No Changes Required

### Backend (`apps/api`)

| File | Status | Notes |
|---|---|---|
| `db.py` | ✅ KEEP | Async SQLAlchemy engine, correct connection setup |
| `models.py` | ✅ KEEP | 12 tables, proper FKs, UniqueConstraints — solid schema |
| `schemas.py` | ✅ KEEP | Pydantic v2 response models |
| `cache.py` | ✅ KEEP | Redis cache layer with TTL |
| `config.py` | ✅ NEW | Added Day 1 — pydantic-settings fail-fast validation |
| `requirements.txt` | ✅ KEEP | Correct stack, all Phase 2 deps present |
| `alembic/` | ✅ KEEP | Migration infrastructure |
| `routes/drivers.py` | ✅ KEEP | Clean REST route |
| `routes/constructors.py` | ✅ KEEP | Clean REST route |
| `routes/circuits.py` | ✅ KEEP | Clean REST route |
| `routes/seasons.py` | ✅ KEEP | Standings, intelligence endpoints |
| `routes/standings.py` | ✅ KEEP | Clean |
| `routes/search.py` | ✅ KEEP | Unified search endpoint |
| `routes/races.py` | ✅ KEEP | Race detail endpoints |
| `routes/analytics.py` | ✅ KEEP | Analytics queries |
| `ingestion/ingest.py` | ✅ KEEP | Jolpica pipeline with tenacity + exponential backoff |
| `ingestion/integrity_audit.py` | ✅ KEEP | FK violation + null position checker |
| `ml/engine.py` | ✅ KEEP | XGBoost inference engine |
| `ml/train.py` | ✅ KEEP | Training pipeline |
| `ml/features.py` | ✅ KEEP | Feature engineering |
| `ml/model.pkl` | ✅ KEEP | Trained model artifact |
| `ml/validation.py` | ✅ KEEP | Model validation |
| `ml/calibration.py` | ✅ KEEP | Probability calibration |
| `scripts/integrity_audit.py` | ✅ KEEP | Production DB audit tool |

### Frontend (`apps/web`)

| File | Status | Notes |
|---|---|---|
| `lib/api.ts` | ✅ KEEP | Centralized API client (updated Day 1) |
| `lib/config.ts` | ✅ NEW | Added Day 1 — centralized API config, fail-fast |
| `lib/constants/drivers.ts` | ✅ KEEP | Clearly labelled constant file |
| `lib/constants/teams.ts` | ✅ KEEP | Clearly labelled constant file |
| `app/` (route architecture) | ✅ KEEP | App Router, correct structure |
| `components/ErrorBoundary.tsx` | ✅ KEEP | Required for 3D component isolation |
| `components/Skeleton.tsx` | ✅ KEEP | ISR-safe loading states |
| `components/Footer.tsx` | ✅ KEEP | Static, clean |
| `components/StandingsTable.tsx` | ✅ KEEP | Real data, stable |
| `components/Race/ResultsTable.tsx` | ✅ KEEP | Real data |
| `components/Race/QualifyingTable.tsx` | ✅ KEEP | Real data |
| `components/Race/PitStopTimeline.tsx` | ✅ KEEP | Real data (pit_stops table) |
| `hooks/useWeekendState.ts` | ✅ KEEP | Useful for calendar live/archived logic |
| `hooks/useCountdown.ts` | ✅ KEEP | Countdown to next session |
| `packages/types/` | ✅ KEEP | Shared TypeScript interfaces |

### Infra

| File | Status | Notes |
|---|---|---|
| `pnpm-workspace.yaml` | ✅ KEEP | Monorepo config |
| `docker-compose.yml` (root) | ✅ KEEP | CI parity |
| `next.config.ts` | ✅ KEEP | Webpack watcher exclusions, correct |
| `.github/workflows/refresh_assets.yml` | ✅ KEEP | Asset refresh automation |

---

## REFACTOR — Good Idea, Unstable Implementation

These files stay but must be fixed before use in new UI work.

| File | Problem | Priority |
|---|---|---|
| `components/Navbar.tsx` | Hardcoded hex (fixed Day 1), Framer Motion (fixed Day 1) | ✅ Done Day 1 |
| `components/HistoryChart.tsx` | Recharts not dynamically imported (fixed Day 1) | ✅ Done Day 1 |
| `components/PointsChart.tsx` | Recharts not dynamically imported (fixed Day 1) | ✅ Done Day 1 |
| `components/Race/PositionTrace.tsx` | Math.random() + no dynamic import (fixed Day 1) | ✅ Done Day 1 |
| `components/Race/StrategyIntelligence.tsx` | Framer Motion for bar widths (fixed Day 1) | ✅ Done Day 1 |
| `components/TeamDetailClient.tsx` | 17KB monolithic client component | Day 2 — split into server + islands |
| `components/Search/OmniSearchCortex.tsx` | 11KB, mounted globally in layout (removed Day 1) | Move to route-level lazy load |
| `components/Race/PositionTrace.tsx` | Uses fake position data (no real telemetry) | Day 2 — needs real data or remove |
| `components/Race/RacePACEAnalytics.tsx` | Recharts, audit data source | Day 2 |
| `components/Predictions/PredictionCard.tsx` | Audit real data flow | Day 2 |
| `apps/api/routes/races.py` | Missing 404 guards | Day 2 |
| `apps/api/routes/predictions.py` | ML input validation gaps | Day 2 |
| `apps/web/app/globals.css` | Full token system (fixed Day 1) | ✅ Done Day 1 |

---

## DELETE — Removed in Phase 2 Day 1

All items below were committed in `chore: remove phase 1 cinematic systems`.

| File | Reason |
|---|---|
| `context/OrchestrationContext.tsx` | Global cinematic state machine driving full-tree re-renders |
| `components/AudioEngine.tsx` | Howler audio engine with non-existent audio assets |
| `components/SceneCanvas.tsx` | Singleton WebGL canvas, `dpr=[1,2]`, always rendering. Thermal bomb. |
| `components/TelemetryHUD.tsx` | Depended on OrchestrationContext. AnimatePresence on every step. |
| `components/Car3D.tsx` | `frameloop` not set (defaults to always). No real model. |
| `components/CarViewer3D/` | R3F + postprocessing + Framer Motion inside Canvas. GLB doesn't exist. |
| `components/LiveTiming/CinematicTrackMap.tsx` | Infinite SVG dash animation. Hardcoded Monza. |
| `components/LiveTiming/MissionControlHUD.tsx` | `Math.random()` for lap times. No real data. |
| `components/LiveTiming/ReplayOrchestrator.tsx` | Hardcoded `http://localhost:8000`. Deferred to Phase 3. |
| `components/Race/RaceReplayHUD.tsx` | Replay system. Phase 3. |
| `components/Race/RaceMomentFeed.tsx` | No stable data source. |
| `components/Race/StorylineCard.tsx` | Purely cinematic narrative. No data. |
| `components/Race/FastestLapCinematic.tsx` | Cinematic. No stable data. |
| `apps/api/routes/simulation.py` | Live timing simulation. Deferred to Phase 3. |
| `apps/api/ml/explainability.py` | SHAP — adds 40MB. Deferred to Phase 3. |
| `ingestion.log` | 34MB binary log file committed to repo. |
