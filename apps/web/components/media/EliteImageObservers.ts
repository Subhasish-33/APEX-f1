/**
 * EliteImageObservers.ts
 * Telemetry and failure reporting for the EliteImage runtime.
 */
export function emitMediaFallback(detail: {
  entity_ref?: string;
  category?: string;
  failed_url: string;
  fallback_to: string;
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("apex:media:fallback", {
        detail,
      })
    );
  }
}

export function emitMediaIncident(detail: {
  entity_ref?: string;
  category?: string;
  message: string;
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("apex:media:incident", {
        detail,
      })
    );
  }
}
