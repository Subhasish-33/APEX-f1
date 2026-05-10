import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ── Turbopack (Next.js 16 default) ───────────────────────────────────────
  // Empty config silences the webpack/turbopack conflict warning.
  // The webpack config below is preserved for watch options only.
  turbopack: {},

  // ── Image Optimization ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.formula1.com" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.supabase.co" },     // Supabase Storage
      { protocol: "https", hostname: "**.cloudinary.com" },  // Cloudinary CDN
    ],
  },

  // ── Environment Variables ────────────────────────────────────────────────
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
  },

  // ── Dev Indicators ────────────────────────────────────────────────────────
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },

  // ── File Watcher Optimization ─────────────────────────────────────────────
  // Prevents Next.js from watching large binary/generated files that will
  // NEVER affect the UI — this is a primary cause of CPU spikes and
  // infinite rebuild storms on MacBook Air.
  webpack: (config, { isServer }) => {
    // Exclude heavy asset directories and ML artifacts from the watcher
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: [
        // Standard ignores
        "**/node_modules/**",
        "**/.git/**",
        "**/.next/**",
        // 3D models and team assets (large binary files — never need rebuilding)
        "**/public/models/**",
        "**/public/assets/cars/**",
        "**/public/assets/teams/**",
        // ML artifacts
        "**/*.pkl",
        "**/ml_models/**",
        "**/ml/__pycache__/**",
        // Telemetry & replay dumps
        "**/telemetry/**",
        "**/replay_dumps/**",
        "**/*.csv",
        // Ingestion logs
        "**/ingestion.log",
        "**/*.log",
        // Scratch and test scripts (not part of the web app)
        "**/scratch/**",
        "**/tests/**",
        "**/scripts/**",
        // Python bytecode
        "**/__pycache__/**",
        "**/*.pyc",
      ],
      // Increase poll interval to reduce CPU load from file watching
      poll: false, // Use native FS events (efficient on macOS)
      aggregateTimeout: 500, // Wait 500ms before rebuilding after a change
    };

    return config;
  },

  // ── Build Optimizations ───────────────────────────────────────────────────
  // Disable source maps in development to reduce memory usage
  // (comment this out if you need source maps for debugging)
  // productionBrowserSourceMaps: false,
};

export default bundleAnalyzer(nextConfig);
