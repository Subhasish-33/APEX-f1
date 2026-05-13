import { TOKENS } from "./tokens";

export function getTeamColor(ref: string | undefined): string {
  if (!ref) return TOKENS.colors.brand.f1Red;

  const mapping: Record<string, string> = {
    "red_bull": TOKENS.colors.teams.redBull,
    "ferrari": TOKENS.colors.teams.ferrari,
    "mercedes": TOKENS.colors.teams.mercedes,
    "mclaren": TOKENS.colors.teams.mclaren,
    "aston_martin": TOKENS.colors.teams.astonMartin,
    "alpine": TOKENS.colors.teams.alpine,
    "williams": TOKENS.colors.teams.williams,
    "rb": TOKENS.colors.teams.rb,
    "sauber": TOKENS.colors.teams.sauber,
    "haas": TOKENS.colors.teams.haas,
  };

  // Handle both snake_case and kebab-case
  const normalizedRef = ref.replace(/-/g, "_");
  return mapping[normalizedRef] || TOKENS.colors.brand.f1Red;
}
