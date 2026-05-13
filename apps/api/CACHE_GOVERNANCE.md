# Cache Governance — APEX-F1

## 1. Strategy Overview
We use a tiered caching strategy with Redis (Upstash) to ensure sub-100ms response times for high-traffic endpoints while maintaining data freshnes.

## 2. TTL Policy
| Entity | TTL (seconds) | Rationale |
|--------|---------------|-----------|
| Static (Circuits, Historical Seasons) | 86400 (24h) | Data rarely changes. |
| Dynamic (Standings, Active Season Races) | 3600 (1h) | Updates once per session/day. |
| AI Predictions | 3600 (1h) | Context-dependent, needs regular refresh. |
| Search Results | 3600 (1h) | Balancing relevance and speed. |

## 3. Key Structure
Format: `f1:{version}:{entity}:{params}`
- `f1:v1:driver:hamilton`
- `f1:v1:standings:2024`

## 4. Resilience & Fallback
- **Fail-Soft**: The `cache.py` decorator MUST catch all Redis exceptions.
- **Graceful Degradation**: If Redis is unreachable, the request must transparently hit the database.
- **Latency Budget**: Cache lookups must not add more than 50ms to the request.

## 5. Invalidation
- Manual invalidation via `invalidate(key)` after data ingestion or manual corrections.
- No automated "stale-while-revalidate" on the backend; reliance on TTL.
