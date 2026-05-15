export interface MediaDeliveryEnvelope {
  asset_id?: string | null;
  entity_ref?: string;
  category?: string;
  lifecycle_state?: string;
  is_production_safe?: boolean;
  freshness?: string | null;
  certification?: string;
  delivery?: {
    url?: string | null;
    avif_url?: string | null;
    srcset?: string;
    variant_name?: string;
    format?: "avif" | "webp" | "jpeg";
    width?: number | null;
    height?: number | null;
    preload?: boolean;
    cache_policy?: {
      ttl_seconds: number;
      tier: string;
    };
  };
  lqip?: {
    blurhash?: string | null;
    data_uri?: string | null;
  };
  fallback?: {
    strategy: string;
    css_background?: string;
    css_animation?: string;
    primary_color?: string;
    svg_id?: string;
    svg_color?: string;
    text?: string;
    text_color?: string;
    render_type?: string;
    aria_label?: string;
  };
  composition?: {
    focal_point?: { x: number; y: number };
    aspect_ratio?: number | null;
    has_transparency?: boolean;
    safe_text_zone?: string;
  };
  attribution?: {
    required?: boolean;
    text?: string | null;
    license_url?: string | null;
  };
  palette?: {
    vibrant?: string;
    dark?: string;
    muted?: string;
    light?: string;
  };
  optimization?: {
    webp_available?: boolean;
    avif_available?: boolean;
    blurhash_available?: boolean;
    optimization_version?: number;
  };
  runtime_fallback_chain?: Array<{
    url: string;
    format: string;
    variant: string;
    width?: number;
    height?: number;
  }>;
}

export interface EliteImageProps {
  envelope?: MediaDeliveryEnvelope;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  context?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  showDebugBadge?: boolean;
}

export type LoadState =
  | "idle"       // mounted, not started
  | "lqip"       // showing blur placeholder
  | "loading"    // full image loading
  | "loaded"     // full image displayed
  | "fallback";  // CSS fallback strategy active
