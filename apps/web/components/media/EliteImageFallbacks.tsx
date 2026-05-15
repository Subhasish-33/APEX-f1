import React from "react";
import { MediaDeliveryEnvelope } from "./EliteImageTypes";

export function FallbackRenderer({
  fallback,
  className,
  label,
}: {
  fallback: MediaDeliveryEnvelope["fallback"];
  className?: string;
  label?: string;
}) {
  if (!fallback) return null;

  const style: React.CSSProperties = {};
  if (fallback.css_background) {
    style.background = fallback.css_background;
  }
  if (fallback.css_animation) {
    style.animation = fallback.css_animation;
  }

  return (
    <div
      className={`elite-image-fallback ${className ?? ""}`}
      style={style}
      role="img"
      aria-label={label || fallback.aria_label || "Media placeholder"}
    >
      {fallback.text && (
        <span
          className="elite-image-fallback-text"
          style={{ color: fallback.text_color ?? "rgba(255,255,255,0.15)" }}
        >
          {fallback.text}
        </span>
      )}
    </div>
  );
}
