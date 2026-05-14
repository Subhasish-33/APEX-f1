# APEX-F1 Data Ingestion Policy (v2.0)
## Canonical Motorsport Data Warehouse Governance

### 1. Hierarchy of Truth
Competitive truth in APEX-F1 is tiered to prevent reconciliation drift:
1. **Tier 0 (The Source):** Jolpica (Historical) / OpenF1 (Live Telemetry).
2. **Tier 1 (The Fact):** `results` table. This is the **Canonical Competitive Truth**.
3. **Tier 2 (The Derived):** `driver_standings` and `constructor_standings`. These are **Derived Truths** and must be recomputable from Tier 1 facts.

### 2. Ingestion Principles
- **Idempotency:** Every ingestion script must be safe to run $N$ times.
- **Deterministic Upserts:** Use `ON CONFLICT` logic. Never allow partial record duplicates.
- **Atomic Operations:** Ingestion for a specific Race Weekend must succeed or fail as a single unit.
- **Source Attribution:** Every record must be traceable to its ingestion provider.

### 3. Conflict Resolution
- If a drift is detected between `results` and `standings`, the `results` table prevails.
- Standings reconciliation scripts must be run after every historical import.

### 4. Integrity Constraints
- No race can have multiple drivers in the same `position`.
- No season can have multiple races in the same `round`.
- No driver can have multiple results for the same `race_id`.

### 5. Race State Machine
All races must transition through these states:
`scheduled` → `live` → `completed` → `archived`
(Fallback: `canceled`, `pending`)
