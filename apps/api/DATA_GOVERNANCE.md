# APEX-F1 Data Governance Policy
## Version 1.0.0 | Operational Maturity Phase

### 1. Canonical Truth Hierarchy
APEX-F1 adheres to a strict hierarchy for data reconciliation:
1.  **Tier 0: Official Timing (Live)** - Direct telemetry feeds (where available).
2.  **Tier 1: Canonical Warehouse (Historical)** - Reconstructed historical facts from verified sources (Jolpi/Ergast).
3.  **Tier 2: Derived Truth** - Internally recomputed standings and statistics.
4.  **Tier 3: Predictive Intelligence** - Inference and simulation data.

### 2. Ingestion & Overwrite Policy
*   **Idempotency**: All ingestion scripts must be idempotent.
*   **Overwrite Rules**: Historical facts (2023 and earlier) are "Frozen." Current season data is subject to "Soft Overwrite" (update if changed) until the season is marked `ARCHIVED`.
*   **Manual Intervention**: Any manual data correction must be logged in the `governance_audit` table with a timestamp and rationale.

### 3. State Awareness Definitions
The platform recognizes the following explicit states for any Race event:
*   **SCHEDULED**: Date/Time is in the future. No results or telemetry expected.
*   **PENDING**: Race date has passed, but results are not yet ingested/verified.
*   **LIVE**: Current time is within the session window (Race Start + 3 hours).
*   **COMPLETED**: Results are ingested and mathematical truth (standings) is recomputed.
*   **ARCHIVED**: Season is finished, data is frozen and verified.
*   **CANCELED**: Event was officially removed from the calendar.

### 4. Telemetry Availability Policy
*   **Availability Marker**: Every race must expose a `telemetry_status` boolean.
*   **Fallback Logic**: If `telemetry_status` is `false`, the frontend must transition to "Technical Summary" mode rather than showing "No Data Found."
*   **Future Readiness**: Telemetry schemas are defined in the database but may remain null for future or historical races where data is unavailable.

### 5. Data Freshness & Reconciliation
*   Every entity must include `last_updated` (UTC) and `ingestion_version`.
*   **Reconciliation Cadence**: Current season standings are recomputed after every successful result ingestion.
*   **Drift Detection**: The `verify_truth.py` suite must run weekly to detect any discrepancies between ingested results and derived standings.

### 6. Operational Monitoring
*   **Silent Failures**: Prohibited. Any ingestion error must trigger a record in the `platform_health` log.
*   **Stale Data**: Any "Live" race with no updates for >10 minutes during the session window is flagged as `STALE`.
