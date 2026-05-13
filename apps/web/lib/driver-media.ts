/**
 * APEX-F1 Driver Media Registry
 * Central source of truth for all driver-related assets.
 */

export interface DriverMedia {
  hero: string;
  casual: string;
  blur: string;
}

export const DRIVER_MEDIA: Record<string, DriverMedia> = {
  // Hardcoded overrides if needed
};

export const getDriverMedia = (ref: string | undefined): DriverMedia => {
  const fallback: DriverMedia = {
    hero: "/assets/drivers/_placeholder.webp",
    casual: "/assets/drivers/_placeholder.webp",
    blur: "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoUAAoAAUAmJaQAA3AA/v8AAQAA", 
  };

  if (!ref) return fallback;
  const normalized = ref.replace(/-/g, "_");
  
  // If in registry, use it
  if (DRIVER_MEDIA[normalized]) return DRIVER_MEDIA[normalized];

  // Otherwise, use the standard pattern
  return {
    hero: `/assets/drivers/${normalized}/hero.webp`,
    casual: `/assets/drivers/${normalized}/casual.webp`,
    blur: `/assets/drivers/${normalized}/blur.webp`,
  };
};
