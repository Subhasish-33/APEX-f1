# APEX Media Runtime Audit
# Tier 5 / Phase 2 — Observability & Monitoring

## Purpose

This document defines what the media runtime must track, how failures surface,
and what the response procedures are for each failure class.

Runtime observability is not optional. A media system that can't measure itself
cannot be trusted. Every failure class has an explicit signal and response.

---

## 1. Runtime Failure Classes

### Class A: Render Failures (client-side)

| Event | Signal | Threshold | Response |
|-------|--------|-----------|----------|
| AVIF negotiation failure | `apex:media:fallback` event | >5% of AVIF requests | Disable AVIF for asset class |
| CDN URL 404 | `apex:media:fallback` event | Any | Re-run sync_media_registry.py |
| All URLs exhausted | `apex:media:fallback` (fallback=true) | Any | Flag asset DEGRADED, audit |
| LQIP missing | Absence of lqip.data_uri | >10% of assets | Re-run generate_variants.py |
| CSS fallback rendered | `apex:media:fallback` (strategy=true) | >2% of renders | Coverage gap alert |

**Collection mechanism (EliteImage V2):**
```javascript
window.addEventListener("apex:media:fallback", (e) => {
  // Send to analytics/observability backend
  fetch("/api/media/observe", {
    method: "POST",
    body: JSON.stringify(e.detail),
  });
});
```

---

### Class B: Pipeline Failures (server-side)

| Event | Signal | Threshold | Response |
|-------|--------|-----------|----------|
| Budget violation | `budget_ok=False` in variant manifest | Any | Block clearance, fix source |
| Checksum mismatch | `checksum_verified=False` | Any | Re-ingest, check source integrity |
| Verification failure | `lifecycle_state=FAILED` | Any | Check source URL, re-queue |
| CDN upload failure | `sync_media_registry.py` exit code 1 | Any | Retry with `--force` |
| Blurhash generation failure | Warning in generate_variants.py log | Any | Install blurhash library |
| Clearance denied | `audit_log` action=CLEARANCE_DENIED | Any | Review failures, fix blockers |

**Collection mechanism (audit_media_ops.py):**
Run daily: `python scripts/media/audit_media_ops.py --export-json`
JSON report is stored in `scratch/media_audit_{timestamp}.json`.
Set up CI/cron to alert on non-zero exit code.

---

### Class C: Performance Regressions

| Metric | Measurement | Budget | Alert Threshold |
|--------|-------------|--------|-----------------|
| Variant file size | `variants[x].bytes` in manifest | See MEDIA_PERFORMANCE_POLICY.md | >110% of budget |
| LCP (Core Web Vitals) | Browser RUM / Vercel Analytics | ≤ 2.5s | >3.0s |
| CLS | Browser RUM | 0 | >0.05 |
| AVIF coverage | `avif_available` in registry | Target 100% | <50% ACTIVE assets |
| Blurhash coverage | `blurhash` in registry | Target 100% | <80% ACTIVE assets |
| CDN cache hit rate | Supabase Storage logs | Target >90% | <70% |

---

### Class D: Delivery Contract Failures

| Failure | Detection | Response |
|---------|-----------|----------|
| `is_production_safe=True` but URL returns 404 | Runtime fallback event | Re-sync CDN, set DEGRADED |
| `cdn_url` is external URL (not our CDN) | `audit_media_ops.py` | Re-run sync_media_registry.py |
| Asset served with no cache headers | API response inspection | Fix cache manager integration |
| Budget-violated asset reaches ACTIVE state | Not possible — audit blocks it | If found: incident, audit trail |

---

## 2. Observability API Endpoint

Add this endpoint to track client-side failures centrally:

```
POST /api/media/observe
Content-Type: application/json

{
  "event":        "fallback" | "lcp" | "error",
  "entity_ref":   "hamilton",
  "category":     "HEADSHOT",
  "failed_url":   "https://…/hamilton/headshot/hero.webp",
  "fallback_to":  "https://…/hamilton/headshot/card.webp",
  "lifecycle":    "ACTIVE",
  "variant":      "hero",
  "format":       "webp",
  "timestamp":    "2025-05-15T14:00:00Z",
  "viewport":     "mobile" | "desktop",
  "user_agent":   "…"
}
```

This endpoint logs to the platform's existing operational log stream.
No PII — only asset identifiers and render metadata.

---

## 3. Daily Audit Checklist

Run this sequence daily during active development:

```bash
# 1. Check lifecycle distribution
python scripts/media/audit_media_ops.py

# 2. Check clearance blockers  
python scripts/media/audit_media.py --report

# 3. Export full JSON audit
python scripts/media/audit_media_ops.py --export-json

# 4. Check registry API health
curl https://apex-f1-api.railway.app/media/registry/status
```

Expected healthy response from `/media/registry/status`:
```json
{
  "status": "OPERATIONAL",
  "lifecycle_distribution": {
    "ACTIVE": ">0",
    "PROCESSING": "0 (after full pipeline)",
    "FAILED": "0",
    "PENDING_CLEARANCE": "0"
  },
  "clearance": {
    "production_safe": ">0"
  },
  "coverage_pct": ">50"
}
```

---

## 4. CDN Latency Monitoring

Monitor Supabase Storage delivery latency:
- Target: < 100ms for cached CDN responses
- Measure: Timing from `delivery.url` fetch start to first byte
- Alert: > 500ms p95 latency

If Supabase Storage is degraded, the local CDN fallback (`apps/web/public/assets/media/`)
will serve assets from the Next.js static file server.
This is slower but always available.

---

## 5. Local CDN Pruning Policy

The local CDN fallback directory (`apps/web/public/assets/media/`) must be pruned to
prevent repository and deployment bundle bloat.

### Pruning Rules

1. **After successful CDN sync**: Remove local files where `cdn_url` is confirmed active.
2. **After lifecycle → ARCHIVED**: Remove all variants for the archived asset.
3. **After optimization_version bump**: Remove old variant files (they are unreachable).
4. **Scheduled**: Files older than 30 days with no corresponding DB record are safe to delete.

### Pruning Command (add --clean flag to sync_media_registry.py in Phase 3)
```bash
python scripts/media/sync_media_registry.py --clean
```

### What NOT to prune
- Files for ACTIVE assets where `cdn_url` is `null` (these are the only serving copy)
- SVG files (tiny — no pruning needed)
- Blur variants (needed for LQIP even if CDN is serving)

---

## 6. Mobile Delivery Regression Detection

Specific checks for mobile delivery quality:

| Check | Command | Expected |
|-------|---------|----------|
| Mobile variant generated | Inspect `variants.mobile` | Present in all ACTIVE assets |
| Mobile budget respected | `variants.mobile.bytes < 122880` | True |
| Mobile focal crop correct | Visual spot-check of mobile variant | Driver visible |
| No mobile preloads (default) | `preload_governor` logs | `count=0` on mobile routes |
| Save-Data respected | Check `variants.thumbnail` served | Thumbnail on save-data |

---

## 7. Incident Response

### Severity 1: Production serving broken images

**Trigger**: >5% of renders hitting CSS fallback on a production page.

**Response**:
1. Run `audit_media.py --report` immediately
2. Check `media/registry/status` endpoint
3. If cdn_url stale: run `sync_media_registry.py`
4. If asset DEGRADED: check source URL, re-run `verify_media.py`
5. Document in `audit_log` under action=INCIDENT

### Severity 2: Budget violation discovered in ACTIVE asset

**Note**: This should not be possible — `audit_media.py` blocks it.
If it happens, it means `audit_media.py` was bypassed or modified.

**Response**:
1. Set `is_production_safe=False` manually via database
2. Audit the audit trail to find how clearance was granted
3. Re-run pipeline from generate_variants.py
4. Post-mortem required

### Severity 3: AVIF negotiation failure rate > 10%

**Response**:
1. Disable AVIF for affected entity class
2. Set `avif_available=False` for affected assets
3. Investigate pillow-avif-plugin installation
4. Re-run generate_variants.py with AVIF re-enabled after fix
