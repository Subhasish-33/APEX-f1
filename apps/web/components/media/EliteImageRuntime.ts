import { useState, useEffect, useCallback, useRef } from "react";
import { MediaDeliveryEnvelope, LoadState } from "./EliteImageTypes";
import { emitMediaFallback, emitMediaIncident } from "./EliteImageObservers";

const MAX_FALLBACK_ATTEMPTS = 3;

export function useEliteImageRuntime(
  envelope: MediaDeliveryEnvelope,
  onLoad?: () => void,
  onError?: (error: string) => void
) {
  const delivery = envelope.delivery ?? {};
  const lqip = envelope.lqip ?? {};
  const isProductionSafe = envelope.is_production_safe ?? false;

  const fallbackChain = useRef<Array<{ url: string; format: string }>>([]);
  const fallbackIndex = useRef(0);
  const attemptCount = useRef(0);

  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!isProductionSafe || !delivery.url) {
      setLoadState("fallback");
      return;
    }

    const chain: Array<{ url: string; format: string }> = [];
    if (delivery.avif_url) chain.push({ url: delivery.avif_url, format: "avif" });
    if (delivery.url) chain.push({ url: delivery.url, format: delivery.format ?? "webp" });
    
    // Add up to MAX_FALLBACK_ATTEMPTS from the runtime chain to prevent waterfalls
    if (envelope.runtime_fallback_chain) {
      chain.push(...envelope.runtime_fallback_chain.slice(0, MAX_FALLBACK_ATTEMPTS));
    }

    fallbackChain.current = chain;
    fallbackIndex.current = 0;
    attemptCount.current = 0;

    const hasLqip = !!(lqip.data_uri || lqip.blurhash);
    setLoadState(hasLqip ? "lqip" : "loading");
    setActiveSrc(chain[0]?.url ?? null);
  }, [envelope.asset_id, isProductionSafe, delivery.url]);

  const handleLoad = useCallback(() => {
    setLoadState("loaded");
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    attemptCount.current += 1;
    const nextIndex = fallbackIndex.current + 1;

    if (nextIndex < fallbackChain.current.length && attemptCount.current <= MAX_FALLBACK_ATTEMPTS) {
      fallbackIndex.current = nextIndex;
      setActiveSrc(fallbackChain.current[nextIndex].url);
      
      emitMediaFallback({
        entity_ref: envelope.entity_ref,
        category: envelope.category,
        failed_url: fallbackChain.current[nextIndex - 1].url,
        fallback_to: fallbackChain.current[nextIndex].url,
      });
    } else {
      setLoadState("fallback");
      const errorMsg = `All URLs exhausted or max attempts reached for ${envelope.entity_ref}/${envelope.category}`;
      emitMediaIncident({
        entity_ref: envelope.entity_ref,
        category: envelope.category,
        message: errorMsg,
      });
      onError?.(errorMsg);
    }
  }, [envelope.entity_ref, envelope.category, onError]);

  return {
    loadState,
    activeSrc,
    handleLoad,
    handleError,
  };
}
