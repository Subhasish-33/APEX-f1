import React from "react";
import { MediaDeliveryEnvelope } from "./EliteImageTypes";

export function focalToObjectPosition(focal?: { x: number; y: number }): string {
  if (!focal) return "center center";
  const x = Math.round(focal.x * 100);
  const y = Math.round(focal.y * 100);
  return `${x}% ${y}%`;
}

export function AttributionOverlay({
  attribution,
}: {
  attribution: MediaDeliveryEnvelope["attribution"];
}) {
  if (!attribution?.required || !attribution?.text) return null;

  return (
    <div className="elite-image-attribution" aria-label="Image attribution">
      {attribution.license_url ? (
        <a
          href={attribution.license_url}
          target="_blank"
          rel="noopener noreferrer"
          className="elite-image-attribution-link"
        >
          {attribution.text}
        </a>
      ) : (
        <span>{attribution.text}</span>
      )}
    </div>
  );
}
