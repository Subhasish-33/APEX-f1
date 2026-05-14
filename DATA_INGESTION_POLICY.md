# APEX-F1 Data Ingestion Policy (DIP)
Version: 1.0.0
Status: ACTIVE
Last Audit: 2026-05-14

## 1. Objective
To maintain the "Verified Truth" baseline of the APEX-F1 Motorsport Operating System. This policy ensures all data entering the warehouse is deterministic, audited, and certified for integrity.

## 2. Ingestion Tiers

### Tier 1: Canonical (VERIFIED)
*   **Source**: Official Ergast API / FastF1 Telemetry.
*   **Protocol**: Automatic ingestion via `scripts/ingest/`.
*   **Requirement**: Must pass the `scripts/audit/certify_truth.py` check with 100% row-count and point-sum parity.
*   **Status**: Locked. No manual edits permitted.

### Tier 2: Reconciliation (PARTIAL)
*   **Source**: Secondary sources / Manual reconciliation loops.
*   **Protocol**: Ingested but flagged as `is_verified=False`.
*   **Requirement**: Pending manual audit or cross-reference verification.
*   **Goal**: Upgrade to Tier 1 within 30 days of ingestion.

### Tier 3: Archival (ARCHIVAL)
*   **Source**: Historical records (1950–2009).
*   **Protocol**: Isolated from live intelligence streams.
*   **Constraint**: Served with "Archival" metadata to notify users of reduced deterministic confidence.

## 3. Mandatory Ingestion Workflow
All data ingestion must follow the "Certification Loop":
1.  **Ingest**: Run standard ingestion script.
2.  **Audit**: Run `certify_truth.py --year <YEAR>`.
3.  **Lock**: Update the `seasons` table with `is_verified=True` and `coverage_confidence=1.0`.
4.  **Pulse**: API freshness timestamp updated to signal frontend hydration.

## 4. Governance Constraints
*   **No Manual DB Edits**: Direct SQL mutations to race results or standings are strictly prohibited.
*   **Schema Enforcement**: All models must include integrity metadata (`last_audit_at`, `status`).
*   **Failure Protocol**: If an audit fails, the season must be downgraded to `PARTIAL` immediately.

## 5. Enforcement
The APEX-F1 API will programmatically reject or flag data that does not meet the minimum `coverage_confidence` threshold defined for a specific operational mode.
