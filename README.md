# APEX-F1

A modern Formula 1 platform focused on race data, standings, drivers, teams, schedules, telemetry playback, and predictive analytics.

APEX-F1 combines a production-grade FastAPI backend with a high-performance Next.js frontend to deliver a fast, data-first motorsport experience inspired by the future of F1.

---

## Philosophy

APEX-F1 is no longer a “cinematic experiment.”

The platform is being rebuilt around:

* real F1 data integrity
* production-grade architecture
* fast navigation
* premium motorsport UI
* scalable infrastructure
* explainable ML predictions
* thermal/performance stability

The goal is simple:

> Build the best independent Formula 1 intelligence platform on the web.

---

# Core Features

## Drivers & Teams

* Complete driver database
* Team profiles and constructor standings
* Driver statistics and historical performance
* Headshots, branding, and metadata
* Dynamic standings and points tracking

---

## Race Calendar & Results

* Full season schedule
* Session timelines
* Grand Prix results
* Circuit information
* Race detail pages
* Historical season coverage

---

## Predictions Engine

Machine learning pipeline trained on historical Formula 1 data.

### Current Capabilities

* Race outcome predictions
* Podium probability estimation
* Top-10 ranking forecasts
* Feature-engineered inference pipeline
* Redis-cached predictions
* Explainable prediction factors

### ML Stack

* XGBoost
* Scikit-learn
* Pandas
* NumPy

---

## Live Timing Simulation

Replay historical races using lap-by-lap timing data.

### Includes

* Interactive track maps
* Driver position playback
* Lap progression
* Speed controls
* Telemetry-inspired race visualization

---

## Search System

Global omni-search across:

* drivers
* teams
* circuits
* races
* seasons

Built for fast navigation and low-latency querying.

---

# Tech Stack

## Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts

## Backend

* FastAPI
* SQLAlchemy 2.0
* PostgreSQL
* Alembic
* Redis

## Infrastructure

* Supabase
* Upstash Redis
* Railway
* Vercel
* GitHub Actions

---

# Architecture

```text
apps/
├── api/        → FastAPI backend
├── web/        → Next.js frontend
└── packages/   → shared types/utilities
```

---

# Local Development

## 1. Clone Repository

```bash
git clone https://github.com/Subhasish-33/APEX-f1.git
cd APEX-f1
```

---

## 2. Backend Setup

```bash
cd apps/api

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

Create:

```bash
apps/api/.env
```

Add:

```env
DATABASE_URL=your_supabase_url
REDIS_URL=your_upstash_url
```

Run migrations:

```bash
alembic upgrade head
```

Start backend:

```bash
uvicorn main:app --reload
```

---

## 3. Frontend Setup

```bash
cd apps/web

pnpm install
pnpm dev
```

---

# Environment

## Production Infrastructure

| Service  | Provider      |
| -------- | ------------- |
| Frontend | Vercel        |
| Backend  | Railway       |
| Database | Supabase      |
| Cache    | Upstash Redis |

---

# Performance Direction

APEX-F1 prioritizes:

* low thermal overhead
* minimal client-side rendering
* server-first architecture
* optimized bundle size
* responsive mobile performance
* scalable API design

Heavy experimental 3D systems and over-engineered orchestration layers were intentionally removed during Phase 2 stabilization.

---

# Current Status

## Completed

* stable monorepo architecture
* cloud database migration
* Redis caching layer
* prediction inference pipeline
* standings and race APIs
* frontend design token system
* CI/CD workflows
* thermal stabilization pass

## In Progress

* official F1-level data parity
* live timing refinement
* news integration
* team/driver media pipelines
* production deployment hardening

---

# Roadmap

## Phase 2

* official F1 parity rebuild
* drivers/teams/news completion
* frontend UX overhaul
* mobile-first optimization

## Phase 3

* advanced telemetry
* race replay enhancements
* explainable AI predictions
* strategy simulations

## Phase 4

* true real-time live timing
* multi-user race rooms
* fantasy and strategy systems

---

# License

MIT License

---

Built by Subhasish Kumar Sahu.
