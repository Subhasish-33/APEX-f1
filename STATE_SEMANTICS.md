# APEX-F1 State Semantics Governance
## Canonical Platform State Definitions

This document defines the deterministic semantics of all states within the APEX-F1 platform. Any addition to or modification of these states must be reflected here to prevent "state explosion" and semantic drift.

---

### 1. Session Lifecycle (`SessionState`)
Governs the temporal status of a specific motorsport event (FP1, Quali, Race).

| State | Semantic Meaning | Allowed Transitions |
| :--- | :--- | :--- |
| `SCHEDULED` | The event exists in the calendar but has not reached its UTC start window. | `GREEN_FLAG`, `CANCELLED` |
| `GREEN_FLAG` | The event is currently active based on UTC time and provider confirmation. | `COMPLETED`, `ABANDONED` |
| `COMPLETED` | The event has concluded. All track activity is finished. | `ARCHIVED` |
| `ARCHIVED` | Results are certified and the session data is frozen. | None |

---

### 2. Telemetry Flow (`TelemetryState`)
Governs the availability and freshness of high-frequency data streams.

| State | Semantic Meaning | Invalidation Rule |
| :--- | :--- | :--- |
| `INACTIVE` | No telemetry is expected. Polling is disabled. | Pulse trigger only. |
| `AVAILABLE` | Telemetry is flowing and fresh (< 10s drift). | Drift > 60s -> `STALE` |
| `STALE` | Provider is active but data is lagging behind real-time. | Drift < 10s -> `AVAILABLE` |
| `OFFLINE` | Provider is unresponsive or session is closed. | Circuit Breaker Trip. |

---

### 3. Truth Certification (`SyncStatus`)
Governs the reliability of the data warehouse records.

| State | Semantic Meaning | Backend Action |
| :--- | :--- | :--- |
| `UNAUDITED` | Raw data ingested but not yet verified against constraints. | Block frontend display. |
| `CERTIFIED` | Data has passed all `audit()` gates and matches competitive truth. | Allow caching/display. |
| `LOCKED` | Historical truth that cannot be modified by sync pulses. | Reject all write attempts. |

---

### 4. Operational Health (`HealthStatus`)
Governs the status of the synchronization engine itself.

| State | Semantic Meaning | UI Implication |
| :--- | :--- | :--- |
| `HEALTHY` | All pulse jobs are succeeding within expected duration. | Normal operation. |
| `DEGRADED` | Some circuit breakers have tripped but core data is flowing. | Show "Service Lag" warning. |
| `UNSTABLE` | Multiple critical failures. Sync is halted. | Show "Maintenance" banner. |

---

### 🟢 Mandatory Rules
1. **No Frontend Inference**: The frontend must never calculate state (e.g., comparing `Date.now()` to `session.date`). It must strictly consume the state delivered by the API.
2. **Deterministic Transitions**: States can only move in the order defined above. Any "jump" is a critical failure.
3. **Audit First**: No data reaches `CERTIFIED` without a successful `audit()` pass.
