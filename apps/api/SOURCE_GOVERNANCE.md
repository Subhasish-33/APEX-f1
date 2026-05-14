# APEX-F1 Source Governance Policy (v1.0)
## Deterministic Provider Ownership & Conflict Resolution

### 1. Provider Ownership Matrix
To maintain a single source of truth, providers are assigned non-overlapping responsibilities.

| Domain | Primary Source | Secondary/Fallback | Authority Level |
| :--- | :--- | :--- | :--- |
| **Historical Results** | Jolpica (Ergast) | Wikipedia/FIA | CANONICAL |
| **Season Schedules** | Jolpica | OpenF1 | OPERATIONAL |
| **Live Telemetry** | OpenF1 | N/A | TRANSIENT (Pre-Audit) |
| **Driver/Team Metadata**| Wikipedia/Media | In-House | EDITORIAL |
| **Weather/Track State** | OpenF1 | Local Sensor Proxy| OPERATIONAL |

### 2. Conflict Resolution Rules
When data points from multiple sources overlap, the following hierarchy applies:
1. **Verified > Unverified:** Any data manually certified or passing the `certify_truth` audit overrides unverified incoming syncs.
2. **Canonical > Operational:** Jolpica results always override OpenF1 preliminary results once the weekend is concluded.
3. **Audit Lock:** Once a `Season` or `Race` is marked as `is_verified=True`, the Synchronization Engine is prohibited from overwriting `results` or `standings` without a `FORCE_UNSTABLE` flag.

### 3. Ingestion Hierarchy
Synchronization must flow through the following authority layers:
1. **Source Discovery:** Identifying new rounds or schedule changes.
2. **Temporal Hydration:** Ingesting raw data into transient staging or partial fact tables.
3. **Reconciliation:** Comparing incoming data with existing warehouse facts.
4. **Certification Loop:** Running the `audit()` protocol before promoting to `Verified Truth`.

### 4. Overwrite Policy
- **Results:** NEVER overwrite unless `audit()` fails or source version increases.
- **Telemetry:** High-frequency overwrite permitted during live windows; locked post-weekend.
- **Standings:** Always derived from `results`. Overwriting `standings` requires a full recalculation from Tier 1 facts.

### 5. Fallback Behavior
- If a primary provider (e.g., Jolpica) is unreachable, the Sync Engine must **NOT** attempt to synthesize competitive truth from secondary sources without an explicit `FALLBACK_AUTHORITY` state.
- In the event of a total provider outage, the platform enters **STASIS MODE**, serving the last known `Verified Truth` with a `STALE_SYNC` warning.
