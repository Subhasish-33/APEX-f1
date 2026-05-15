"use client";

/**
 * EliteImage V2 — apps/web/components/media/EliteImage.tsx
 * =========================================================
 * Tier 5 / Phase 2 — Frontend Media Runtime
 *
 * PURPOSE
 * -------
 * The universal media runtime contract for APEX-F1.
 * Every image on the platform flows through this component.
 *
 * This is NOT a simple next/image wrapper.
 * It is the client-side delivery orchestration layer.
 *
 * RESPONSIBILITIES
 * ----------------
 * 1. Reads the DeliveryEnvelope from the media API
 * 2. Reserves exact pixel space (width/height/aspect_ratio) before image loads
 * 3. Renders LQIP blur as immediate CSS background (zero network wait)
 * 4. Negotiates AVIF → WebP → fallback chain on error
 * 5. Displays FallbackStrategy CSS descriptor when no URL is available
 * 6. Shows attribution overlay when attribution_required = true
 * 7. Manages progressive transition: blur → full image (smooth, zero CLS)
 * 8. Reports runtime failures to the observability layer
 * 9. Handles suspense-safe rendering during hydration
 * 10. Applies focal-point-aware CSS object-position
 *
 * USAGE
 * -----
 * <EliteImage
 *   envelope={mediaEnvelope}
 *   className="w-full h-full"
 *   priority={true}
 *   context="profile_hero"
 * />
 *
 * Or with inline props (no envelope — builds minimal envelope internally):
 * <EliteImage
 *   src="/assets/media/driver/hamilton/headshot/hero.webp"
 *   width={1200}
 *   height={800}
 *   alt="Lewis Hamilton"
 * />
 *
 * VISUAL PHILOSOPHY
 * -----------------
 * - Transitions are smooth and intentional — not jarring
 * - Fallbacks look premium — not broken
 * - Attribution overlays are subtle — not intrusive
 * - Loading states are invisible — not spinners
 */

import React, { useState, useEffect } from "react";
import NextImage from "next/image";
import { MediaDeliveryEnvelope, EliteImageProps } from "./EliteImageTypes";
import { useEliteImageRuntime } from "./EliteImageRuntime";
import { FallbackRenderer } from "./EliteImageFallbacks";
import { focalToObjectPosition, AttributionOverlay } from "./EliteImageTransitions";

function buildMinimalEnvelope(props: EliteImageProps): MediaDeliveryEnvelope {
  return {
    is_production_safe: !!props.src,
    lifecycle_state: props.src ? "ACTIVE" : "DEGRADED",
    delivery: {
      url: props.src,
      avif_url: null,
      srcset: "",
      width: props.width,
      height: props.height,
      preload: props.priority,
    },
    lqip: { blurhash: null, data_uri: null },
    fallback: { strategy: "APEX_PLACEHOLDER", render_type: "branded_placeholder" },
    composition: { focal_point: { x: 0.5, y: 0.35 }, aspect_ratio: props.width && props.height ? props.width / props.height : undefined },
    attribution: { required: false },
    optimization: { webp_available: true, avif_available: false, blurhash_available: false },
  };
}

export default function EliteImage({
  envelope: envelopeProp,
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  containerClassName = "",
  context = "default",
  lazy = true,
  onLoad,
  onError,
  showDebugBadge = false,
}: EliteImageProps) {
  const envelope = envelopeProp ?? buildMinimalEnvelope({ src, width, height, priority });
  const delivery = envelope.delivery ?? {};
  const composition = envelope.composition ?? {};
  const lqip = envelope.lqip ?? {};
  const fallback = envelope.fallback;

  const { loadState, activeSrc, handleLoad, handleError } = useEliteImageRuntime(
    envelope,
    onLoad,
    onError
  );

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const imageWidth = delivery.width ?? width;
  const imageHeight = delivery.height ?? height;
  const aspectRatio = composition.aspect_ratio ?? (imageWidth && imageHeight ? imageWidth / imageHeight : undefined);

  const containerStyle: React.CSSProperties = {};
  if (aspectRatio) {
    containerStyle.aspectRatio = String(aspectRatio);
  }

  const lqipBackground = lqip.data_uri ? `url("${lqip.data_uri}")` : undefined;
  const objectPosition = focalToObjectPosition(composition.focal_point);

  if (!isMounted) {
    return (
      <div
        className={`elite-image-container elite-image-ssr ${containerClassName}`}
        style={{
          ...containerStyle,
          backgroundImage: lqipBackground,
          backgroundSize: "cover",
          backgroundPosition: `${(composition.focal_point?.x ?? 0.5) * 100}% ${(composition.focal_point?.y ?? 0.35) * 100}%`,
        }}
        aria-label={alt ?? envelope.entity_ref ?? "Loading"}
      />
    );
  }

  return (
    <div className={`elite-image-container ${containerClassName}`} style={containerStyle}>
      {lqipBackground && loadState !== "loaded" && (
        <div
          className={`elite-image-lqip ${loadState === "loaded" ? "elite-image-lqip-hidden" : ""}`}
          style={{
            backgroundImage: lqipBackground,
            backgroundSize: "cover",
            backgroundPosition: objectPosition,
          }}
          aria-hidden="true"
        />
      )}

      {loadState === "fallback" && fallback && (
        <FallbackRenderer
          fallback={fallback}
          className="elite-image-fallback-full"
          label={alt ?? envelope.entity_ref}
        />
      )}

      {loadState !== "fallback" && activeSrc && imageWidth && imageHeight && (
        <picture>
          {delivery.avif_url && <source srcSet={delivery.avif_url} type="image/avif" />}
          {delivery.srcset && <source srcSet={delivery.srcset} type="image/webp" />}
          <NextImage
            src={activeSrc}
            alt={alt ?? envelope.entity_ref ?? ""}
            width={imageWidth}
            height={imageHeight}
            priority={priority}
            loading={priority ? "eager" : lazy ? "lazy" : "eager"}
            className={[
              "elite-image-img",
              loadState === "loaded" ? "elite-image-loaded" : "elite-image-loading",
              className,
            ].join(" ")}
            style={{ objectPosition }}
            onLoad={handleLoad}
            onError={handleError}
            unoptimized={activeSrc.startsWith("data:")}
          />
        </picture>
      )}

      {loadState === "loaded" && <AttributionOverlay attribution={envelope.attribution} />}

      {showDebugBadge && process.env.NODE_ENV === "development" && (
        <div className="elite-image-debug">
          {envelope.lifecycle_state} | {delivery.variant_name} | {delivery.format}
          {envelope.optimization?.avif_available ? " | AVIF✓" : ""}
          {envelope.optimization?.blurhash_available ? " | BH✓" : ""}
        </div>
      )}
    </div>
  );
}

// ── CSS class reference (add to global.css) ───────────────────────────────────
/*
.elite-image-container {
  position: relative;
  overflow: hidden;
  background: transparent;
}

.elite-image-lqip {
  position: absolute;
  inset: 0;
  transition: opacity 400ms ease-out;
  will-change: opacity;
}

.elite-image-lqip-hidden {
  opacity: 0;
  pointer-events: none;
}

.elite-image-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 300ms ease-in-out;
  will-change: opacity;
}

.elite-image-loading {
  opacity: 0;
}

.elite-image-loaded {
  opacity: 1;
}

.elite-image-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.elite-image-fallback-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  font-weight: 600;
  text-transform: uppercase;
  user-select: none;
}

.elite-image-attribution {
  position: absolute;
  bottom: 4px;
  left: 6px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1;
  pointer-events: auto;
}

.elite-image-attribution-link {
  color: inherit;
  text-decoration: none;
}

.elite-image-attribution-link:hover {
  color: rgba(255, 255, 255, 0.7);
}

.elite-image-debug {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.75);
  color: #00ff88;
  font-family: monospace;
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 2px;
  pointer-events: none;
}

@keyframes apex-glow-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
*/
