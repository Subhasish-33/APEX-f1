# 🛠️ APEX-F1 — Development Guide

This guide explains how to run the APEX-F1 platform efficiently on a local MacBook Air using a **hybrid-cloud architecture** that keeps your machine cool and responsive.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  LOCAL MACHINE (MacBook Air)             │
│                                                         │
│   Next.js Dev Server          FastAPI (uvicorn)         │
│   (apps/web)                  (apps/api)                │
│        │                           │                    │
└────────┼───────────────────────────┼────────────────────┘
         │                           │
         ▼                           ▼
┌────────────────┐         ┌─────────────────────┐
│   Vercel CDN   │         │  Supabase PostgreSQL │
│  (production)  │         │  (cloud DB — free)  │
└────────────────┘         └─────────────────────┘
                                     │
                           ┌─────────────────────┐
                           │   Upstash Redis     │
                           │  (cloud cache—free) │
                           └─────────────────────┘
```

**Docker Desktop is NOT required for normal development.**

---

## First-Time Setup

### 1. Supabase (Free Database)

1. Go to **https://supabase.com** → Create a new project
2. Navigate to: **Project Settings → Database → Connection string**
3. Select **"Transaction pooler"** tab (port **6543**)
4. Copy the URI — it looks like:
   ```
   postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
5. Add `+asyncpg` after `postgresql` for async SQLAlchemy:
   ```
   postgresql+asyncpg://postgres.xxxx:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
6. Paste this into `apps/api/.env` as `DATABASE_URL`

### 2. Upstash (Free Redis)

1. Go to **https://upstash.com** → Create a Redis database
2. Select the **closest region** to you (reduces latency)
3. Navigate to: **Database → .env** tab
4. Copy the `REDIS_URL` (it starts with `rediss://...`)
5. Paste it into `apps/api/.env` as `REDIS_URL`

### 3. Run Database Migrations

```bash
cd apps/api
source ../../.venv/bin/activate   # or: source .venv/bin/activate
export $(grep -v '^#' .env | xargs)
alembic upgrade head
```

### 4. Install Dependencies

```bash
# Frontend
cd apps/web && pnpm install && cd ../..

# Backend
pip install -r apps/api/requirements.txt
```

---

## Dev Modes

Choose the lightest mode for your current task.

### 🎨 Frontend Only (~400MB RAM)
*Use when: building UI components, styling, routing*

```bash
pnpm dev:frontend
# or:
bash scripts/dev/start_frontend.sh
```
Opens: **http://localhost:3000**

---

### ⚡ Backend Only (~250MB RAM)
*Use when: building API routes, testing ML predictions, data ingestion*

```bash
pnpm dev:backend
# or:
bash scripts/dev/start_backend.sh
```
Opens: **http://localhost:8001** · Docs: **http://localhost:8001/docs**

---

### 🚀 Full Stack (~650MB RAM)
*Use when: testing end-to-end features*

```bash
pnpm dev:full
# or:
bash scripts/dev/start_full.sh
```

Press `Ctrl+C` to stop both servers cleanly.

---

### 🔥 Emergency Cleanup (Fan spinning, terminal frozen)

```bash
pnpm infra:cleanup
# or:
bash scripts/dev/cleanup.sh
```

This kills all orphan `node`, `uvicorn`, and watcher processes.

---

## Environment Variables Reference

### `apps/api/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase Transaction Pooler URL (port 6543) |
| `REDIS_URL` | ✅ | Upstash Redis URL (`rediss://...`) |
| `ENVIRONMENT` | Optional | `development` or `production` |

### `apps/web/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | FastAPI URL (`http://localhost:8001` in dev) |
| `NEXT_PUBLIC_ENABLE_LIVE_REPLAY` | Optional | `false` by default (saves RAM) |

---

## ML Training — Remote Only

> ⚠️ **NEVER run `train.py` or `backfill_features.py` locally.**

See **[scripts/ml/README_TRAINING.md](scripts/ml/README_TRAINING.md)** for full instructions on:
- Training on RunPod ($0.20/hr)
- Training on Google Colab (free)
- Downloading and committing the model artifact

---

## Production Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | Connect GitHub → auto-deploys on `main` |
| Backend | **Railway** or **Render** | Set env vars in dashboard |
| Database | **Supabase** | Already cloud — just update `DATABASE_URL` |
| Redis | **Upstash** | Already cloud — just update `REDIS_URL` |
| ML Training | **RunPod / Paperspace** | Manual trigger, commit artifact |
| Assets | **Supabase Storage** or **Cloudflare R2** | For large 3D models and media |

---

## Monitoring & Diagnostics

```bash
# Real-time CPU pressure
top -o cpu

# Real-time memory pressure
top -o mem

# Memory breakdown
vm_stat

# Swap usage (if non-zero, you're in trouble)
sysctl vm.swapusage

# Kill everything APEX-related and start fresh
pnpm infra:cleanup
```

---

## What NOT to Run Locally

| Task | Why | Alternative |
|---|---|---|
| `docker compose up` | Docker VM uses 1–2GB RAM | Supabase + Upstash |
| `python train.py` | XGBoost uses 4–8 cores | RunPod / Colab |
| `python backfill_features.py` | Long-running, high I/O | Remote execution |
| Chrome + DevTools + 3D + Replay | GPU + RAM pressure | Use Safari for 3D testing |
| Full historical ingestion | Blocks terminal for hours | Remote execution |
