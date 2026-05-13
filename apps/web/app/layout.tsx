import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

// ── Typography — Phase 2 Frozen Spec ─────────────────────────────────────────
// Self-hosted fonts to ensure zero external DNS lookups.
const inter = localFont({
  src: "../public/fonts/Inter-Regular.woff2",
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = localFont({
  src: "../public/fonts/BarlowCondensed-Bold.ttf",
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../public/fonts/JetBrainsMono-Regular.woff2",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APEX F1 | Formula 1 Intelligence Platform",
  description:
    "All 10 teams, 20 drivers, full 2025 season calendar, race results back to 2010, live standings, and ML-backed race predictions.",
  openGraph: {
    title: "APEX F1 | Formula 1 Intelligence Platform",
    description: "Real F1 data. ML predictions. Zero noise.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans">
        <Navbar />
        <main className="flex-grow relative z-10">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
