import type { Config } from "tailwindcss";
import { TOKENS } from "./lib/tokens";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: TOKENS.colors.brand.f1Red,
          gold: TOKENS.colors.brand.gold,
        },
        bg: {
          primary: TOKENS.colors.bg.primary,
          secondary: TOKENS.colors.bg.secondary,
          tertiary: TOKENS.colors.bg.tertiary,
        },
        text: {
          primary: TOKENS.colors.text.primary,
          secondary: TOKENS.colors.text.secondary,
          muted: TOKENS.colors.text.muted,
        },
        status: {
          success: TOKENS.colors.status.success,
          warning: TOKENS.colors.status.warning,
          danger: TOKENS.colors.status.danger,
          info: TOKENS.colors.status.info,
        },
      },
      fontFamily: {
        display: [TOKENS.typography.fonts.display, "system-ui", "sans-serif"],
        sans: [TOKENS.typography.fonts.sans, "system-ui", "sans-serif"],
        mono: [TOKENS.typography.fonts.mono, "monospace"],
      },
      spacing: {
        xs: TOKENS.spacing.xs,
        sm: TOKENS.spacing.sm,
        md: TOKENS.spacing.md,
        lg: TOKENS.spacing.lg,
        xl: TOKENS.spacing.xl,
        "2xl": TOKENS.spacing.2xl,
        "3xl": TOKENS.spacing.3xl,
      },
      borderRadius: {
        sm: TOKENS.radii.sm,
        md: TOKENS.radii.md,
        lg: TOKENS.radii.lg,
      },
      transitionDuration: {
        micro: TOKENS.motion.duration.micro,
        standard: TOKENS.motion.duration.standard,
        transition: TOKENS.motion.duration.transition,
        reveal: TOKENS.motion.duration.reveal,
      },
      transitionTimingFunction: {
        "ease-out": TOKENS.motion.easing.out,
        "ease-in": TOKENS.motion.easing.in,
      },
      zIndex: {
        dropdown: TOKENS.zIndex.dropdown,
        sticky: TOKENS.zIndex.sticky,
        overlay: TOKENS.zIndex.overlay,
        modal: TOKENS.zIndex.modal,
        popover: TOKENS.zIndex.popover,
        toast: TOKENS.zIndex.toast,
      },
    },
  },
  plugins: [],
};

export default config;
