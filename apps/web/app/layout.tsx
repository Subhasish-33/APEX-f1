import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Inter, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

// ── Typography — Phase 2 Frozen Spec ─────────────────────────────────────────
// Display: Barlow Condensed (hero titles, team names, driver surnames)
// Interface: Inter (headings, body, labels, nav)
// Data: JetBrains Mono (lap times, telemetry, code values)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  weight: ["700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
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
