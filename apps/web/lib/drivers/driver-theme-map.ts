/**
 * APEX-F1 Team Theme Map
 * Defines the visual DNA for each constructor.
 */

export interface TeamTheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  shadow: string;
  telemetryOverlay: string;
}

export const TEAM_THEMES: Record<string, TeamTheme> = {
  red_bull: {
    primary: "#3671C6",
    secondary: "#0600EF",
    accent: "#FFEC00",
    gradient: "linear-gradient(135deg, #3671C6 0%, #0600EF 100%)",
    shadow: "rgba(54, 113, 198, 0.4)",
    telemetryOverlay: "rgba(255, 236, 0, 0.15)",
  },
  ferrari: {
    primary: "#E8002D",
    secondary: "#A6001D",
    accent: "#FFFFFF",
    gradient: "linear-gradient(135deg, #E8002D 0%, #272727 100%)",
    shadow: "rgba(232, 0, 45, 0.4)",
    telemetryOverlay: "rgba(255, 255, 255, 0.1)",
  },
  mercedes: {
    primary: "#27F4D2",
    secondary: "#00A19C",
    accent: "#FFFFFF",
    gradient: "linear-gradient(135deg, #27F4D2 0%, #000000 100%)",
    shadow: "rgba(39, 244, 210, 0.3)",
    telemetryOverlay: "rgba(39, 244, 210, 0.15)",
  },
  mclaren: {
    primary: "#FF8000",
    secondary: "#1E1E1E",
    accent: "#52E252",
    gradient: "linear-gradient(135deg, #FF8000 0%, #000000 100%)",
    shadow: "rgba(255, 128, 0, 0.4)",
    telemetryOverlay: "rgba(82, 226, 82, 0.15)",
  },
  aston_martin: {
    primary: "#229971",
    secondary: "#064C38",
    accent: "#CEDC00",
    gradient: "linear-gradient(135deg, #229971 0%, #000000 100%)",
    shadow: "rgba(34, 153, 113, 0.4)",
    telemetryOverlay: "rgba(206, 220, 0, 0.1)",
  },
  alpine: {
    primary: "#0093CC",
    secondary: "#FF80B1",
    accent: "#FFFFFF",
    gradient: "linear-gradient(135deg, #0093CC 0%, #FF80B1 100%)",
    shadow: "rgba(0, 147, 204, 0.3)",
    telemetryOverlay: "rgba(255, 255, 255, 0.1)",
  },
  williams: {
    primary: "#64C4FF",
    secondary: "#005AFF",
    accent: "#FFFFFF",
    gradient: "linear-gradient(135deg, #64C4FF 0%, #005AFF 100%)",
    shadow: "rgba(100, 196, 255, 0.4)",
    telemetryOverlay: "rgba(255, 255, 255, 0.1)",
  },
  rb: {
    primary: "#6692FF",
    secondary: "#0000FF",
    accent: "#CCFF00",
    gradient: "linear-gradient(135deg, #6692FF 0%, #0000FF 100%)",
    shadow: "rgba(102, 146, 255, 0.3)",
    telemetryOverlay: "rgba(204, 255, 0, 0.1)",
  },
  sauber: {
    primary: "#52E252",
    secondary: "#000000",
    accent: "#FFFFFF",
    gradient: "linear-gradient(135deg, #52E252 0%, #000000 100%)",
    shadow: "rgba(82, 226, 82, 0.4)",
    telemetryOverlay: "rgba(82, 226, 82, 0.2)",
  },
  haas: {
    primary: "#B6BABD",
    secondary: "#E6002B",
    accent: "#000000",
    gradient: "linear-gradient(135deg, #B6BABD 0%, #E6002B 100%)",
    shadow: "rgba(182, 186, 189, 0.3)",
    telemetryOverlay: "rgba(230, 0, 43, 0.1)",
  },
};

export const getTeamTheme = (ref: string | undefined): TeamTheme => {
  if (!ref) return TEAM_THEMES.haas;
  const normalized = ref.replace(/-/g, "_");
  return TEAM_THEMES[normalized] || TEAM_THEMES.haas;
};
