# APEX-F1 Cache Architecture & Governance

## 1. Temporal Truth Philosophy
Redis is NOT a fast database. It is a **temporal operational memory layer**. Cached truth has freshness, lifetimes, and decay. Stale data is explicitly permitted as a fail-soft measure to ensure perceived platform responsiveness over strict synchronous re-computation.

## 2. Governed TTL Policies
Data is strictly categorized into three operational tiers. 

| Tier | TTL (Freshness) | Stale Threshold (Fail-soft limit) | Cache Example |
| :--- | :--- | :--- | :--- |
| **STATIC** | 24 hours (86,400s) | 7 days | Editorial, biographies, historical race metadata. |
| **WARM** | 5 minutes (300s) | 1 hour | Standings, season schedules. |
| **HOT** | 10 seconds (10s) | 1 minute | Live session state, leaderboard, intervals. |

## 3. Stale-While-Revalidate (SWR) Behavior
The platform strictly forbids cold-path blocking whenever possible.
1. When a key is requested, if `age < TTL`, it returns immediately.
2. If `TTL < age < Stale Threshold`, the cache returns the stale payload immediately **AND** fires an async background task to recompute the canonical truth. The returned payload modifies its envelope to expose `state.freshness = STALE` and `state.degraded = true`.
3. If `age > Stale Threshold`, a cold cache miss is processed synchronously.

## 4. Cache Invalidation Discipline
Invalidation logic MUST NOT be scattered across routers. It is centrally orchestrated via `cache.invalidation`:
*   `invalidate_key(key)`
*   `invalidate_domain(domain)` (e.g. invalidating `apex:standings:*` upon a successful synchronization pulse).

## 5. Fail-Soft Outage Resilience
The `CacheManager` intercepts all Redis connection failures and timeout exceptions. Rather than returning 500 Internal Server Errors, it safely bypasses the cache layer, increments the `redis_failures` metric, and queries the database synchronously. APEX-F1 will remain operational even if the Redis cluster is destroyed.
