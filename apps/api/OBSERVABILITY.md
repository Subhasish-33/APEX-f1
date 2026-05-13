# Observability Strategy — APEX-F1

## 1. Logging Standards
- **Development**: Readable, colorized logs (default).
- **Production**: Structured JSON logs (for ingestion by Datadog/CloudWatch).
- **Severity Levels**:
    - `INFO`: Normal lifecycle events (startup, ingestion completion).
    - `WARNING`: Graceful degradation (Redis offline, ML fallback used).
    - `ERROR`: Recoverable failures (Database timeout, API drift detected).
    - `CRITICAL`: System failure (OOM, DB connection lost).

## 2. Metrics to Track
- `api.request.latency`: 95th percentile target < 500ms.
- `cache.hit_rate`: Target > 70% for repeat requests.
- `db.query.duration`: Identify slow joins.
- `contract.validation.failures`: Detect API drift between F/B.

## 3. Production Diagnostics
- Correlation IDs must be passed from the frontend to the backend via `X-Correlation-ID` header.
- Every `ErrorState` on the frontend must display the Correlation ID for support.
