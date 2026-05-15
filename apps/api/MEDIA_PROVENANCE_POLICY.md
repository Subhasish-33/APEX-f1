# APEX Media Provenance Policy
# Tier 5 / Phase 1 — Deterministic Media Infrastructure
# Version: 2.0 (expanded from initial Phase 2A stub)

## 1. Mandate

This document is the legal and operational authority for all media assets on the APEX platform.
Every visual asset — driver, team, circuit, race, article — must have a record in `media_assets`
with complete provenance metadata before it can enter production.

**No asset enters production without:**
- `source_type` set
- `license_type` set
- `clearance_status = True` (set only by `audit_media.py`)
- `is_production_safe = True` (set only by `audit_media.py`)

---

## 2. Legal Boundaries (Absolute)

### STRICTLY FORBIDDEN
- Direct mirroring of assets from F1.com or FIA.com
- Downloading images from official broadcast screenshots
- Hotlinking to official team website CDNs
- Using press-kit images without a documented editorial use basis
- Serving any asset with `source_type = OPENF1_EPHEMERAL` directly in production
  (OpenF1's `headshot_url` field will be removed at the end of the 2026 season)
- Using AI-generated images that closely resemble specific copyrighted race photographs

### PERMITTED WITH ATTRIBUTION
- Wikimedia Commons images under CC-BY-SA 4.0 (with attribution_text displayed in UI)
- OpenStreetMap-derived circuit geometry under ODbL (attribution in footer)

### PERMITTED WITHOUT ATTRIBUTION (commercial-free licenses)
- Unsplash photos under the Unsplash License
- Pexels photos under the Pexels License
- APEX proprietary AI-generated abstract motorsport textures

### PERMITTED EDITORIALLY (trademarks)
- Team logos sourced from Wikimedia Commons for editorial identification purposes
- The `license_type = TRADEMARK` flag must be set
- These may NOT be used in commercially promotional contexts without explicit licensing

---

## 3. Source Tier System

| Tier | Source Type        | Use Case                          | License Model      |
| ---- | ------------------ | --------------------------------- | ------------------ |
| 1A   | OFFICIAL_PRESS     | Driver/team action photography    | Editorial only     |
| 1B   | WIKIMEDIA          | Portraits, logos, helmets         | CC-BY-SA / Trademark |
| 2    | OSM_DERIVED        | Circuit geometry / track maps     | ODbL               |
| 3A   | STOCK              | Atmospheric backgrounds           | Commercial free    |
| 3B   | AI_GENERATED       | Abstract motorsport textures      | APEX_PROPRIETARY   |
| X    | OPENF1_EPHEMERAL   | Bootstrap only — must migrate     | TBD / ephemeral    |

---

## 4. Provenance Fields (Non-Negotiable)

Every `media_assets` row must have these fields set before clearance:

| Field              | Required For Clearance | Description                              |
| ------------------ | ---------------------- | ---------------------------------------- |
| `source_type`      | ✓ Always               | Legal tier (see table above)             |
| `license_type`     | ✓ Always               | Specific license identifier              |
| `owner_id`         | ✓ Always               | Organization or person who owns rights   |
| `attribution_text` | ✓ If CC or attribution_required | Human-readable credit line     |
| `license_url`      | ✓ If CC license        | Direct link to license deed              |
| `attribution_required` | ✓ Always          | Boolean — drives UI attribution display  |
| `checksum`         | ✓ Always               | SHA-256 of downloaded file               |
| `checksum_verified`| ✓ Always               | Must be True                             |

---

## 5. The Certification Loop

```
ingest_media.py
    ↓ Downloads, creates registry row
    ↓ State: PROCESSING

verify_media.py
    ↓ Re-downloads, verifies checksum
    ↓ Extracts dimensions, transparency
    ↓ State: PENDING_CLEARANCE

generate_variants.py
    ↓ Generates all 7 size variants
    ↓ Writes variant manifest to DB

extract_palette.py
    ↓ Extracts dominant_palette
    ↓ Required before audit

sync_media_registry.py
    ↓ Uploads to Supabase Storage / local CDN
    ↓ Sets internal_url, cdn_url

audit_media.py
    ↓ Evaluates 8 clearance rules
    ↓ ONLY script that sets clearance_status=True
    ↓ ONLY script that sets is_production_safe=True
    ↓ State: ACTIVE (or held in PENDING_CLEARANCE)

Production serving
    ↓ MediaService resolves ACTIVE assets only
    ↓ Fallback chain for any gaps
```

---

## 6. OpenF1 Ephemeral Asset Policy

OpenF1 exposes `headshot_url` in driver metadata. Per their documentation,
this field **will be removed at the end of the 2026 season**.

**APEX Policy:**
1. `ingest_media.py` may use OpenF1 URLs as initial `source_url` values.
2. These are stored with `source_type = OPENF1_EPHEMERAL`.
3. `audit_media.py` BLOCKS clearance for any OPENF1_EPHEMERAL asset that has not been
   downloaded to `internal_url`.
4. `sync_media_registry.py` must run before clearance to internalize these assets.
5. The goal is zero OPENF1_EPHEMERAL assets in ACTIVE state by end of 2025 season.

---

## 7. AI-Generated Asset Governance

AI-generated assets (source_type = AI_GENERATED) are subject to additional rules:

1. Must be generated with a tool owned or licensed by APEX (e.g., via API with clear terms).
2. Must NOT closely resemble a specific real driver or car.
3. Must NOT reproduce copyrighted livery designs.
4. Must be marked with `license_type = APEX_PROPRIETARY`.
5. `owner_id` must be set to `"APEX-F1-Platform"`.
6. May NOT be used as driver headshots or team logos — only for atmospheric/abstract backgrounds.

---

## 8. Attribution Rendering Policy

If `attribution_required = True`, the frontend MUST display attribution.

### Display Rules
- Attribution appears as a `<small>` legal overlay in the bottom-left of the image container.
- Format: `© {attribution_text} — {license_url}`
- Minimum font size: 9px.
- Maximum opacity: 60% (non-intrusive).
- Must be visible on hover/focus for accessibility.

### When Attribution Is Displayed
- All WIKIMEDIA sourced assets where `attribution_required = True`
- All OFFICIAL_PRESS assets with documented editorial restrictions

---

## 9. Audit Trail Requirements

Every state transition in `media_assets` must be logged to the `audit_log` JSON array.
The log must contain:
```json
{
  "action": "INGESTED | VERIFIED | PALETTE_EXTRACTED | CDN_SYNCED | CLEARED | CLEARANCE_DENIED",
  "by": "script_name.py",
  "at": "2025-05-15T14:00:00Z",
  "detail": "..."
}
```

This audit trail is the legal record of how the asset entered production.
It must never be truncated or overwritten — only appended.

---

## 10. Violation Response

If an asset is discovered to violate these rules after reaching ACTIVE state:

1. Set `lifecycle_state = ARCHIVED` immediately.
2. Set `is_production_safe = False`.
3. The MediaService will automatically fall back to the next tier in the fallback chain.
4. Document the violation in the `audit_log`.
5. Notify the engineering team via platform health alerting.

The frontend must never require a deploy to respond to a media violation.
The registry controls production — not the codebase.
