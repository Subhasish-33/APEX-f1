# APEX-F1 — CACHE_TEMPORAL_POLICY.md
## Operational Synchronization Governance v1.0

This policy defines the synchronization cadence, invalidation rules, and staleness thresholds for all data streams within the APEX-F1 Motorsport Operating System.

---

### 1. Temporal Cadence Table

| Data Class | Refresh Cadence | TTL (Redis) | Staleness Threshold | Sync Engine Job |
| :--- | :--- | :--- | :--- | :--- |
| **Session State** | 30 seconds | 60 seconds | 2 minutes | `sync_live_weekend` |
| **Telemetry (Live)** | 10 seconds | 20 seconds | 45 seconds | `sync_telemetry` |
| **Race Results (Live)** | 60 seconds | 120 seconds | 5 minutes | `sync_live_weekend` |
| **Standings** | Post-Race Pulse | 24 hours | 1 hour post-race | `recompute_standings`|
| **Schedule** | Daily Pulse | 24 hours | 12 hours | `sync_schedule` |
| **Weather** | 5 minutes | 10 minutes | 15 minutes | `sync_weather` |
| **Editorial/Bio** | Static (Manual) | 7 days | N/A | Manual |

---

### 2. Invalidation Policy

*   **State-Triggered Invalidation**: When a session transitions from `SCHEDULED` to `GREEN_FLAG`, all cached schedule and weather keys for that `race_id` MUST be invalidated.
*   **Pulse-Based Invalidation**: Successful completion of a `SyncLog` entry with `status="COMPLETED"` must trigger a re-cache pulse for the affected season.
*   **Drift-Triggered Invalidation**: If the `SyncOperationalLogger` detects reconciliation drift > 0.01% in standings, the cache for the entire season must be flushed.

---

### 3. Failover & Staleness Behavior

*   **Graceful Degradation**: If an external provider (Jolpica/OpenF1) is down, the API must serve stale cache with an `X-Temporal-Status: STALE` header.
*   **Telemetery Absence**: If `telemetry_state` is `UNAVAILABLE` or `STALE`, the frontend must render "Historical/Estimate Only" UI modes.
*   **Circuit Breakers**: If a `sync_type` fails 3 times consecutively, the `SyncExecutor` will halt the pulse and set `telemetry_state = DELAYED`.

---

### 4. Implementation Requirements

*   Every API response MUST include `X-Freshness-UTC` and `X-Sync-Version` headers.
*   The `SyncScheduler` is the sole authority for cache-warming pulses.
*   Cache keys must be prefixed by `apex:v1:[tenant]:`.

---

**Engineering Note**: Temporal correctness is prioritized over absolute realtime liveness. We accept 30-second latency to maintain 100% deterministic truth.
