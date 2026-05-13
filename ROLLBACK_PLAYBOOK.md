# Rollback Playbook — APEX-F1

## 1. Frontend Rollback (Vercel)
- **Scenario**: Broken UI, hydration errors.
- **Action**: Use Vercel Dashboard -> Deployments -> Instant Rollback to previous stable build.
- **Verification**: Check `/health` and primary routes.

## 2. Backend Rollback (Railway)
- **Scenario**: API 500s, performance degradation.
- **Action**: `railway rollback`.
- **Verification**: `curl /health`.

## 3. Database Migration Rollback (Alembic)
- **Scenario**: Malformed schema after deploy.
- **Action**: 
    1. Stop API.
    2. `alembic downgrade -1`.
    3. Verify data integrity with `scripts/data_integrity_check.py`.
    4. Restart API.

## 4. Cache Recovery
- **Scenario**: Corrupt data in Redis.
- **Action**: 
    1. `redis-cli FLUSHALL` (via Upstash console).
    2. Monitor for cold-cache performance spikes.
