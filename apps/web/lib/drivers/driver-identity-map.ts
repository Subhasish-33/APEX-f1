/**
 * APEX-F1 Driver Identity Registry
 * Defines the "soul" and personality of each driver's experience.
 */

export type UIPersonality = "aggressive" | "elegant" | "cinematic" | "technical" | "dynamic";
export type CompositionTrait = "brutalist" | "minimalist" | "industrial" | "editorial" | "geometric";

export interface DriverIdentity {
  tagline: string;
  personality: UIPersonality;
  compositionTrait: CompositionTrait;
  visualWeight: "heavy" | "light" | "balanced";
  accentIntensity: number; // 0-1
  motionTone: "energetic" | "smooth" | "sharp";
  signatureColor?: string;
}

export const DRIVER_IDENTITIES: Record<string, DriverIdentity> = {
  max_verstappen: {
    tagline: "Uncompromising Dominance",
    personality: "aggressive",
    compositionTrait: "brutalist",
    visualWeight: "heavy",
    accentIntensity: 0.9,
    motionTone: "energetic",
  },
  hamilton: {
    tagline: "The Standard of Excellence",
    personality: "elegant",
    compositionTrait: "minimalist",
    visualWeight: "light",
    accentIntensity: 0.7,
    motionTone: "smooth",
    signatureColor: "#6B21A8", 
  },
  leclerc: {
    tagline: "The Prince of Monaco",
    personality: "cinematic",
    compositionTrait: "editorial",
    visualWeight: "balanced",
    accentIntensity: 0.8,
    motionTone: "smooth",
  },
  norris: {
    tagline: "A New Chapter of Speed",
    personality: "dynamic",
    compositionTrait: "geometric",
    visualWeight: "light",
    accentIntensity: 0.85,
    motionTone: "energetic",
  },
  alonso: {
    tagline: "The Master of Craft",
    personality: "technical",
    compositionTrait: "industrial",
    visualWeight: "heavy",
    accentIntensity: 0.6,
    motionTone: "sharp",
  },
  piastri: {
    tagline: "Calculated Precision",
    personality: "technical",
    compositionTrait: "geometric",
    visualWeight: "balanced",
    accentIntensity: 0.5,
    motionTone: "smooth",
  },
  russell: {
    tagline: "The Engineer's Choice",
    personality: "elegant",
    compositionTrait: "minimalist",
    visualWeight: "light",
    accentIntensity: 0.6,
    motionTone: "smooth",
  },
  sainz: {
    tagline: "Tactical Brilliance",
    personality: "technical",
    compositionTrait: "industrial",
    visualWeight: "balanced",
    accentIntensity: 0.7,
    motionTone: "sharp",
  },
  perez: {
    tagline: "The King of Streets",
    personality: "aggressive",
    compositionTrait: "brutalist",
    visualWeight: "heavy",
    accentIntensity: 0.8,
    motionTone: "energetic",
  },
  albon: {
    tagline: "Resilient Innovation",
    personality: "dynamic",
    compositionTrait: "editorial",
    visualWeight: "light",
    accentIntensity: 0.6,
    motionTone: "smooth",
  },
};

export const getDriverIdentity = (ref: string | undefined): DriverIdentity => {
  const defaultIdentity: DriverIdentity = {
    tagline: "Driven by Intelligence",
    personality: "dynamic",
    compositionTrait: "editorial",
    visualWeight: "balanced",
    accentIntensity: 0.5,
    motionTone: "smooth",
  };
  
  if (!ref) return defaultIdentity;
  const normalized = ref.replace(/-/g, "_");
  return DRIVER_IDENTITIES[normalized] || defaultIdentity;
};
