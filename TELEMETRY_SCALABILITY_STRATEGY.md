# APEX-F1 Telemetry Scalability Strategy
## Performance, Retention & Archival Blueprint

Telemetry data is the highest-volume stream in the platform. Without a strict scalability strategy, it will inevitably degrade database performance and synchronization throughput.

---

### 1. Data Partitioning Strategy
*   **Time-Series Partitioning**: All telemetry tables (e.g., `LapData`, `CarTelemetry`) must be partitioned by `season` and `race_id`.
*   **Hot/Cold Separation**:
    *   **Hot Storage**: Current season telemetry, indexed for sub-100ms retrieval.
    *   **Cold Storage**: Historical telemetry (> 1 season old), moved to compressed parity tables or columnar storage.

---

### 2. Ingestion Optimization
*   **Batch Writes**: The `SyncTelemetryJob` must use bulk inserts (upsert) instead of individual ORM-tracked objects to minimize transaction overhead.
*   **Downsampling Protocol**: 
    *   **Live View**: 10Hz - 60Hz (raw stream).
    *   **Historical View**: Downsampled to 1Hz for long-term trend analysis.
    *   **Archival**: Aggregated to "Lap Max/Min/Avg" metrics after 24 months.

---

### 3. Indexing & Query Discipline
*   **Composite Indices**: Every telemetry query must filter by `race_id` and `driver_id` before any time-based range scan.
*   **No Wildcards**: Telemetry routes must never return "All Drivers" for a whole race. Queries must be scoped to specific lap ranges or driver subsets.

---

### 4. Retention & Archival Policy
*   **Live Retention**: Full-resolution telemetry kept in the primary DB for the duration of the season.
*   **Post-Season Archival**: Move raw telemetry to S3/Cloud Storage as Parquet files. Delete from primary DB after Season Finale + 30 days.
*   **Permanent Truth**: Only `Results`, `Standings`, and `LapTimes` (summary) are kept permanently in the primary relational database.

---

### 🟢 Operational Guardrails
1. **The 1GB Rule**: If a single race's telemetry exceeds 1GB of raw storage, the `SyncTelemetryJob` must automatically trigger downsampling for non-critical fields (e.g., tire pressure, fuel flow).
2. **Vacuum Schedule**: Automated database vacuuming must be scheduled during the mid-week "Temporal Dead Zone" (Tuesday 02:00 UTC).
