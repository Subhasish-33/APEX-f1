# APEX-F1 API Governance & Contract Layer

## Core Philosophy
The API layer is the canonical public interface of APEX-F1. The frontend must **never** infer state, guess semantics, or transform raw data structures. The API acts as an interpretation layer, presenting deterministic, highly governed contracts to the outside world.

## 1. Response Envelopes
ALL successful API responses MUST be wrapped in the Canonical Response Envelope. Unwrapped arrays or bare objects are strictly prohibited.

```json
{
  "data": { ... }, // Or [] for lists
  "meta": {
    "timestamp": "2024-05-15T12:00:00Z",
    "version": "v1",
    "execution_ms": 42
  },
  "state": {
    "freshness": "LIVE" | "STALE" | "HISTORICAL",
    "certification": "CERTIFIED" | "PROVISIONAL" | "UNVERIFIED",
    "degraded": false
  },
  "pagination": { // Omitted if not a paginated list
    "total": 100,
    "page": 1,
    "size": 20,
    "has_next": true
  }
}
```

## 2. Error Governance
ALL API errors MUST follow the Canonical Error Envelope. FastApi raw exceptions must be caught and mapped to this structure.

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Driver ALO not found in the 2024 season.",
    "status": 404,
    "context": { "ref": "ALO", "season": 2024 }
  },
  "meta": {
    "timestamp": "2024-05-15T12:00:00Z",
    "version": "v1"
  }
}
```

## 3. Service Layer Abstraction (Domain Driven)
Routes (`apps/api/routes/`) MUST NOT contain business logic or raw database queries. 
They act purely as HTTP transport adapters:
1. Validate incoming HTTP Request (Params/Auth).
2. Call `DomainService.method()`.
3. Wrap result in `Canonical Response Envelope`.
4. Return.

All logic lives in `apps/api/services/`. Cross-domain calls must happen at the service layer, not the route layer.

## 4. API Versioning
All routes must be namespaced under `/v1/`. Breaking changes require a `/v2/` namespace.
Schema evolutions must be non-breaking (adding fields is allowed, renaming/removing requires a new version or long deprecation cycle).

## 5. Graceful Degradation
If an underlying system is failing (e.g., telemetry provider offline), the API MUST NOT crash.
It must return the last known state with `state.freshness = "STALE"` and `state.degraded = true`. The frontend uses these flags to adapt the UI, rather than writing defensive try/catch blocks around unpredictable payloads.
