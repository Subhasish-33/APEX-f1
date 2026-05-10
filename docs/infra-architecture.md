# APEX F1 — Infrastructure Architecture

**Phase 2 Frozen — Do not modify without an Architecture Change Request (ACR).**

---

## 1. Frontend Deployment Flow

```
GitHub (main) → Vercel (automatic)
     ↓
  Next.js 16 App Router
  ISR enabled per-route
  Edge Network (Vercel CDN)
     ↓
  NEXT_PUBLIC_API_URL → Railway API
```

- **Platform:** Vercel
- **Build command:** `pnpm --filter web build`
- **Output directory:** `apps/web/.next`
- **Root directory:** `apps/web`
- **Node version:** 20
- **Framework preset:** Next.js

### ISR Strategy

| Route | `revalidate` | Reason |
|---|---|---|
| `/` (home) | 300s (5 min) | Standings widget, last race card |
| `/drivers` | 3600s (1 hr) | Rarely changes mid-season |
| `/drivers/[ref]` | 3600s (1 hr) | Static driver profiles |
| `/teams` | 3600s (1 hr) | Static team data |
| `/teams/[ref]` | 3600s (1 hr) | Static team profiles |
| `/standings` | 300s (5 min) | Updated after each race |
| `/calendar` | 3600s (1 hr) | Race schedule rarely changes |
| `/races/[id]` | 86400s (24 hr) | Historical results are immutable |
| `/predictions` | 3600s (1 hr) | Model runs once per race weekend |

---

## 2. API Deployment Flow

```
GitHub (main) → Railway (automatic Nixpacks build)
     ↓
  FastAPI + Uvicorn (Python 3.12)
  Port: 8000
  Health: /health
     ↓
  Supabase (PostgreSQL) + Upstash (Redis)
```

- **Platform:** Railway
- **Start command:** `uvicorn apps.api.main:app --host 0.0.0.0 --port 8000`
- **Root directory:** `/` (monorepo root, Python path = repo root)
- **Build:** Nixpacks auto-detects `requirements.txt`

---

## 3. Database Architecture

- **Provider:** Supabase (managed PostgreSQL on AWS ap-northeast-1)
- **Connection:** Transaction Pooler (`port 6543`) via `asyncpg`
- **ORM:** SQLAlchemy async + Alembic migrations

### Tables (12 total)

| Table | Description | Row Count Target |
|---|---|---|
| `seasons` | 2010–2025 season years | ~16 |
| `circuits` | Track metadata + circuit personality | ~30 |
| `races` | All race weekends 2010–2025 | ≥ 800 |
| `drivers` | All drivers (active + historical) | ≥ 500 |
| `constructors` | All teams (active + historical) | ~50 |
| `results` | Race finishing results | ≥ 10,000 |
| `driver_standings` | Points after each race | ≥ 5,000 |
| `constructor_standings` | Team points after each race | ≥ 2,000 |
| `qualifying` | Qualifying session results | ≥ 5,000 |
| `pit_stops` | Pit stop events | ≥ 10,000 |
| `lap_times` | Individual lap times (large) | Deferred |
| `prediction_runs` | ML prediction run metadata | Grows with use |

---

## 4. Redis Strategy (Upstash)

- **Provider:** Upstash (serverless Redis, REST API)
- **Connection:** `rediss://` TLS URL via `redis` Python client
- **Usage:** Response caching for frequently hit endpoints

### Cache Keys

| Key Pattern | TTL | Example |
|---|---|---|
| `drivers:list:{page}` | 1hr | `drivers:list:1` |
| `driver:{ref}` | 1hr | `driver:hamilton` |
| `constructors:list:{page}` | 1hr | `constructors:list:1` |
| `constructor:{ref}` | 1hr | `constructor:mercedes` |
| `season:{year}:races` | 1hr | `season:2025:races` |
| `season:{year}:standings:drivers` | 5min | `season:2025:standings:drivers` |
| `prediction:{race_id}` | 24hr | `prediction:1120` |

### Cache Invalidation

- **TTL-based:** All keys expire automatically.
- **Manual:** No manual invalidation in Phase 2 — TTLs are short enough.
- **Post-race:** Standings TTL (5min) ensures fresh data within one ISR cycle.

---

## 5. Environment Variable Mapping

| Variable | Where Defined | Who Consumes |
|---|---|---|
| `DATABASE_URL` | Railway env vars + `apps/api/.env` | FastAPI (`apps/api/db.py`) |
| `REDIS_URL` | Railway env vars + `apps/api/.env` | FastAPI (`apps/api/cache.py`) |
| `ENVIRONMENT` | Railway env vars + `apps/api/.env` | FastAPI (logging, health) |
| `NEXT_PUBLIC_API_URL` | Vercel env vars + `apps/web/.env.local` | Next.js (`apps/web/lib/config.ts`) |
| `VERCEL_TOKEN` | GitHub Secrets | Lighthouse CI workflow |
| `VERCEL_ORG_ID` | GitHub Secrets | Lighthouse CI workflow |
| `VERCEL_PROJECT_ID` | GitHub Secrets | Lighthouse CI workflow |
| `RAILWAY_API_URL` | GitHub Secrets | API health check workflow |

---

## 6. Local Development Rules (Thermal Safety)

> MacBook Air M4 — thermal rules are non-negotiable.

- **MacBook runs:** `pnpm dev` in `apps/web` ONLY
- **Codespaces runs:** FastAPI, ingestion scripts, ML training, alembic
- **Never simultaneously:** Docker + Next.js + FastAPI on the MacBook
- **Database:** Supabase cloud. No local Postgres during active dev.
- **Redis:** Upstash. No local Redis during active dev.
- **`docker-compose.yml`:** CI parity only. Never used during active dev.
