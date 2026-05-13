# Query Performance Audit — Day 3

## 1. Summary of Slowest Queries
Based on `api-verification.log`, the following endpoints require attention:

| Endpoint | Latency (ms) | Risk Factor | Status |
|----------|--------------|-------------|--------|
| `/drivers` | 2348ms | Full table scan for count + limit | **Optimized** (Eager load added) |
| `/drivers/{ref}/career` | 3456ms | Aggregation across `results` x `races` | **Review Required** |
| `/search` | 2037ms | Dynamic `tsvector` calculation | **Review Required** |

## 2. N+1 Audit
| Endpoint | Logic | N+1 Risk | Mitigation |
|----------|-------|----------|------------|
| `/races/{id}` | Nested results/drivers | High | **Fixed**: Using `selectinload` for 3 levels of depth. |
| `/standings` | Driver/Constructor relations | High | **Fixed**: Using `selectinload` for entities. |
| `/drivers` | Simple list | Low | No relations loaded by default. |

## 3. Indexing Strategy
The following indexes are critical for Day 3 performance:

- `drivers(driver_ref)`: [EXISTING] Unique index for fast lookup.
- `results(driver_id, race_id)`: [EXISTING] Unique constraint/index for career lookups.
- `races(year, round)`: [EXISTING] Composite index for standings lookup.
- **[NEW REQUIRED]**: GIN index on `tsvector` for search if volume increases.

## 4. Payload Minimization
- Enforced Pydantic `response_model` on all routes to strip internal fields.
- **Standard**: All collections are paginated (default 20, max 100).
