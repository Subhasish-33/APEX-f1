import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SceneCanvas } from "@/components/SceneCanvas";
import { OrchestrationProvider } from "@/context/OrchestrationContext";
import { AudioEngine } from "@/components/AudioEngine";
import { TelemetryHUD } from "@/components/TelemetryHUD";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APEX F1 | Advanced Formula 1 Analytics",
  description: "Real-time F1 data, historical archives, and AI-powered race predictions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-f1-dark text-white font-sans">
        <OrchestrationProvider>
          <Navbar />
          <main className="flex-grow relative z-10">
            {children}
          </main>
          <SceneCanvas />
          <AudioEngine />
          <TelemetryHUD />
          <Footer />
        </OrchestrationProvider>
      </body>
    </html>
  );
}
