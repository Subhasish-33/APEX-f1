# Contract Versioning — APEX-F1

## 1. Schema Permanence
The API contract is frozen at `v0.1.0`.
- **Snake_Case**: All backend responses use `snake_case` keys.
- **CamelCase**: Frontend may convert to `camelCase` via lib/api, but raw payloads are `snake_case`.

## 2. Breaking Changes
- No existing fields may be removed or renamed.
- New fields MUST be nullable or have a default value.
- Breaking changes require a path prefix update (e.g., `/api/v2/...`).

## 3. Standardization
- Dates: ISO 8601 (`YYYY-MM-DD`).
- Timestamps: ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`).
- Currency/Points: `float` (not string).
- Enums: Upper case strings (`STABLE`, `RAIN`, `DEGRADED`).
