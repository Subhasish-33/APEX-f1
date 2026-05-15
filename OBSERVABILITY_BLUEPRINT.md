# APEX-F1 Operational Observability Blueprint
## Architecture for the Platform Control Plane

This document outlines the architectural requirements and UX direction for the APEX-F1 Operational Dashboard, designed to contain complexity as we scale to Tier 3.

---

### 1. The "Pulse" Visualization (Ingestion Timeline)
*   **Concept**: A linear Gantt-style view of synchronization pulses.
*   **Data Points**: Start Time, Duration, Job Sequence, Result (Success/Fail/Trip).
*   **Objective**: Identify "Pulse Drift" where ingestion takes longer than the polling interval.

### 2. Telemetry Freshness Map
*   **Concept**: A real-time grid representing all active driver streams.
*   **Metrics**: 
    *   **Drift**: `UTC_Now - Data_Timestamp`.
    *   **Throughput**: Events per second (EPS).
    *   **Jitter**: Variance in arrival times.
*   **Thresholds**: 
    *   < 2s: **Ultra-Fresh** (Green).
    *   2s - 10s: **Healthy** (Yellow).
    *   > 10s: **Stale** (Red).

### 3. Circuit Breaker Control Panel
*   **Concept**: A "Kill Switch" and "Reset" interface for the `SyncExecutor`.
*   **Actions**:
    *   **Manual Trip**: Force a provider offline for maintenance.
    *   **Manual Reset**: Clear failure counters after a known upstream fix.
    *   **Threshold Override**: Temporarily increase the failure threshold for unstable weekends.

### 4. Reconciliation Monitoring
*   **Concept**: An "Audit Log" of every `audit()` and `certify()` pass.
*   **Detection**: Automatically flag records where `JOLPICA_Standings != APEX_Derived_Standings`.
*   **Severity**: Any mismatch is a **CRITICAL** operational alert.

---

### 🟢 Implementation Roadmap
1.  **Phase A**: Expose raw metrics via `/sync/diagnostics` (Completed).
2.  **Phase B**: Build a lightweight "Operator View" in the `/admin` area using Tailwind/Recharts.
3.  **Phase C**: Integrate real-time WebSocket updates for the Telemetry Freshness Map.
