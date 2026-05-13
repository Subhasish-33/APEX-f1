# APEX-F1 — Caching Strategy

**Status: Phase 2 Frozen**

To ensure production scalability and data freshness, APEX-F1 follows a tiered caching strategy.

## 1. Data Classification

| Entity | Frequency | Strategy | Reason |
|---|---|---|---|
| **Driver Profiles** | Low | **Static** | Drivers don't change mid-season. |
| **Team Profiles** | Low | **Static** | Teams are stable throughout the year. |
| **Race Schedule** | Low | **ISR (24h)** | Updates once a day for any sudden time changes. |
| **Standings** | Medium | **ISR (1h)** | Updates after races or steward decisions. |
| **Race Results** | Medium | **ISR (10m)** | High frequency during race weekends. |
| **Live Telemetry** | High | **Dynamic** | Real-time data requires bypass-cache. |
| **ML Predictions** | Medium | **ISR (5m)** | Recalculated as new telemetry arrives. |

---

## 2. Implementation Rules

- **ISR (Incremental Static Regeneration)**: Preferred for all F1 data. Use `revalidate` tag in Next.js fetch.
- **Client Fetching**: Forbidden for static data. Only allowed for user-specific state or ultra-live telemetry bypass.
- **Stale-While-Revalidate**: Frontend should show stale data while background revalidation occurs to ensure zero-latency.
- **Cache Tags**: Use descriptive tags like `drivers`, `teams`, `results:[race_id]` for targeted revalidation via Vercel.

---

## 3. Failure Behavior
- If an ISR revalidation fails, Next.js will continue to serve the last successful static version.
- API retries are managed by `apiSafe`, but once data is cached at the edge, it should remain available even if the backend goes offline temporarily.
