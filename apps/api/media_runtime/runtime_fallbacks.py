"""
APEX Runtime Fallbacks — apps/api/media_runtime/runtime_fallbacks.py
======================================================================
Tier 5 / Phase 2 — Fail-Soft Rendering Orchestration

PURPOSE
-------
Builds deterministic CSS fallback descriptors for every scenario where
a primary media asset is unavailable, unverified, or degraded.

The frontend receives a complete fallback descriptor — it never needs to
guess what to render. The fallback must feel intentional and premium,
not broken.

FALLBACK PHILOSOPHY
-------------------
- Fallbacks are NOT error states — they are rendering contracts.
- Every fallback has a defined visual strategy.
- Fallbacks use team colors, geometric shapes, and motorsport-aware typography.
- No browser-default broken-image icons ever appear.
- The transition from fallback → real image is seamless.

FALLBACK STRATEGIES
-------------------
TEAM_COLOR_GLOW   — Animated radial gradient using team primary color.
                    Used for: team logos, car renders.
                    Requires: dominant_palette.vibrant or team_color.

SILHOUETTE_WIRE   — APEX driver silhouette SVG (motorsport-aware).
                    Used for: driver headshots, helmets.
                    CSS: monochrome SVG with team color fill.

GENERIC_TRACK     — Simple oval/F1-style track outline SVG.
                    Used for: circuit maps when OSM data unavailable.

COLOR_BLOCK       — Solid team primary color block.
                    Used for: flags, thumbnails, simple placeholders.
                    Minimal and clean — never blank.

APEX_PLACEHOLDER  — APEX branded "Signal Lost" panel.
                    Used for: articles, generic unknowns.
                    Contains the APEX logotype in dimmed form.

PROGRESSIVE FALLBACK CHAIN
--------------------------
When the primary CDN URL fails at runtime (network error, 404):
  Step 1: Try avif_url → webp_url (format fallback)
  Step 2: Try smaller variant (retina → hero → card → thumbnail)
  Step 3: Render LQIP blur permanently (data_uri — never fails)
  Step 4: Render FallbackStrategy CSS descriptor
This chain is executed entirely client-side by EliteImage V2.
"""

from __future__ import annotations

import logging
from typing import Dict, Optional

log = logging.getLogger("apex.media_runtime.fallbacks")


# ── Fallback descriptors ──────────────────────────────────────────────────────

def build_fallback_descriptor(
    strategy: str,
    entity_ref: Optional[str],
    category: str,
    palette: Dict[str, str],
) -> dict:
    """
    Build a complete fallback rendering descriptor.

    The frontend renders this directly via CSS when cdn_url is unavailable.
    """
    strategy = _normalize_strategy(strategy)
    team_color = palette.get("vibrant", "#15151E")
    dark_color  = palette.get("dark",    "#0A0A0F")
    muted_color = palette.get("muted",   "#2C2C3A")

    if strategy == "TEAM_COLOR_GLOW":
        return _team_color_glow(team_color, dark_color)
    elif strategy == "SILHOUETTE_WIRE":
        return _silhouette_wire(team_color, entity_ref)
    elif strategy == "GENERIC_TRACK":
        return _generic_track(team_color)
    elif strategy == "COLOR_BLOCK":
        return _color_block(team_color, muted_color)
    else:  # APEX_PLACEHOLDER
        return _apex_placeholder()


def _normalize_strategy(strategy: str) -> str:
    """Strip enum class prefix if present."""
    if hasattr(strategy, "value"):
        return strategy.value
    return str(strategy).replace("FallbackStrategy.", "")


def _team_color_glow(primary: str, dark: str) -> dict:
    return {
        "strategy":       "TEAM_COLOR_GLOW",
        "css_background": f"radial-gradient(ellipse at 50% 40%, {primary}40 0%, {dark} 70%)",
        "css_animation":  "apex-glow-pulse 3s ease-in-out infinite",
        "aria_label":     "Team color placeholder",
        "render_type":    "css_gradient",
        "primary_color":  primary,
        "dark_color":     dark,
        # CSS keyframe name — defined in global styles by EliteImage component
        "keyframes_id":   "apex-glow-pulse",
    }


def _silhouette_wire(team_color: str, entity_ref: Optional[str]) -> dict:
    return {
        "strategy":     "SILHOUETTE_WIRE",
        "svg_id":       "apex-driver-silhouette",   # references inline SVG in the app
        "svg_color":    team_color,
        "aria_label":   f"Driver silhouette: {entity_ref or 'unknown'}",
        "render_type":  "svg_reference",
        "css_filter":   f"drop-shadow(0 0 8px {team_color}60)",
    }


def _generic_track(accent_color: str) -> dict:
    return {
        "strategy":     "GENERIC_TRACK",
        "svg_id":       "apex-generic-track",
        "svg_color":    accent_color,
        "aria_label":   "Circuit map placeholder",
        "render_type":  "svg_reference",
    }


def _color_block(primary: str, muted: str) -> dict:
    return {
        "strategy":       "COLOR_BLOCK",
        "css_background": f"linear-gradient(135deg, {primary} 0%, {muted} 100%)",
        "aria_label":     "Color placeholder",
        "render_type":    "css_gradient",
        "primary_color":  primary,
    }


def _apex_placeholder() -> dict:
    return {
        "strategy":       "APEX_PLACEHOLDER",
        "css_background": "linear-gradient(160deg, #0F0F1A 0%, #1A1A2E 100%)",
        "text":           "SIGNAL LOST",
        "text_color":     "#FFFFFF20",
        "aria_label":     "Media unavailable",
        "render_type":    "branded_placeholder",
        "primary_color":  "#E10600",
    }


# ── Runtime fallback chain ────────────────────────────────────────────────────

def build_runtime_fallback_chain(variants: Optional[dict]) -> list[dict]:
    """
    Builds the ordered fallback chain for client-side progressive degradation.
    EliteImage V2 walks this chain on network failure.

    Returns a list of URL objects in priority order:
    [
      {"url": "…", "format": "avif", "variant": "hero"},
      {"url": "…", "format": "webp", "variant": "hero"},
      {"url": "…", "format": "webp", "variant": "card"},
      {"url": "…", "format": "webp", "variant": "thumbnail"},
    ]
    """
    if not variants:
        return []

    chain = []
    priority_order = ["cinematic", "hero", "card", "mobile", "thumbnail", "blur"]

    for vname in priority_order:
        meta = variants.get(vname)
        if not meta or not meta.get("budget_ok", True):
            continue

        # AVIF first
        avif_url = meta.get("avif_cdn_url") or meta.get("avif_url")
        if avif_url:
            chain.append({
                "url":     avif_url,
                "format":  "avif",
                "variant": vname,
                "width":   meta.get("width"),
                "height":  meta.get("height"),
            })

        # WebP
        webp_url = meta.get("cdn_url") or meta.get("url")
        if webp_url:
            chain.append({
                "url":     webp_url,
                "format":  "webp",
                "variant": vname,
                "width":   meta.get("width"),
                "height":  meta.get("height"),
            })

    return chain
