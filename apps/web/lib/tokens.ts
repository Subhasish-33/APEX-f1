/**
 * APEX-F1 Design Tokens
 * 
 * This is the single source of truth for all visual values in the platform.
 * All CSS variables and Tailwind themes are derived from this file.
 */

export const TOKENS = {
  colors: {
    brand: {
      f1Red: "#E10600",
      gold: "#C8960C",
    },
    bg: {
      primary: "#0A0A0F",
      secondary: "#141420",
      tertiary: "#1E1E2E",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#9CA3AF",
      muted: "#4B5563",
    },
    status: {
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
      info: "#3B82F6",
    },
    teams: {
      redBull: "#3671C6",
      ferrari: "#E8002D",
      mercedes: "#27F4D2",
      mclaren: "#FF8000",
      astonMartin: "#229971",
      alpine: "#0093CC",
      williams: "#64C4FF",
      rb: "#6692FF",
      sauber: "#52E252",
      haas: "#B6BABD",
    }
  },
  
  spacing: {
    0: "0",
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem",   // 64px
  },

  typography: {
    fonts: {
      display: "var(--font-display)",
      sans: "var(--font-inter)",
      mono: "var(--font-mono)",
    },
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "display1": "8rem",
      "display2": "12rem",
      "display3": "16rem",
      "display4": "20rem",
    },
    weights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      black: "900",
    },
  },

  radii: {
    none: "0",
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.5rem",
    full: "9999px",
  },

  motion: {
    duration: {
      micro: "100ms",
      standard: "150ms",
      transition: "200ms",
      reveal: "300ms",
    },
    easing: {
      out: "cubic-bezier(0.16, 1, 0.3, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      mechanical: "cubic-bezier(0.8, 0, 0.2, 1)",
    },
  },

  zIndex: {
    base: "0",
    dropdown: "100",
    sticky: "200",
    overlay: "300",
    modal: "400",
    popover: "500",
    toast: "600",
  },

  borders: {
    subtle: "1px solid rgba(255, 255, 255, 0.1)",
    standard: "1px solid rgba(255, 255, 255, 0.2)",
    strong: "1px solid rgba(255, 255, 255, 0.4)",
  },

  shadows: {
    glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  }
} as const;

export type Tokens = typeof TOKENS;
