# Architecture Baseline v0.1

## 1. Deployment Topology
- **Frontend**: Next.js 16 (Vercel)
- **Backend**: FastAPI (Railway)
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)

## 2. Rendering Strategy
- **Static Pages**: Landing page, historical seasons (ISR 24h).
- **Dynamic Pages**: Active standings, race detail (SSR with 1h cache).
- **Client Components**: Interactive charts, search results, HUD overlays.

## 3. Data Flow
- **Contracts**: Zod (Frontend) + Pydantic (Backend) + Shared TypeScript Types.
- **State**: URL-first state management. No global store (Redux/Zustand) without justification.
- **Fetching**: Centralized `lib/api-safe.ts` with built-in retries and telemetry.

## 4. Design System
- **Tokens**: `lib/tokens.ts` + `globals.css` variables.
- **Assets**: Locally ingested logos/images; no external hotlinking.
- **Motion**: Framer Motion with reduced-motion support.

## 5. Governance
- **Zero-Crash Policy**: Frontend must survive API 5xx, timeouts, and schema drift.
- **Performance Budget**: Initial payload < 200kb JS; Largest Contentful Paint < 2.5s.
