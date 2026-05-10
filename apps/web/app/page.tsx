import { Suspense } from "react";
import HeroRace from "@/components/HeroRace";
import StandingsWidget from "@/components/StandingsWidget";
import LastRaceCard from "@/components/LastRaceCard";
import PredictionCTA from "@/components/PredictionCTA";
import { CardSkeleton, TableSkeleton } from "@/components/Skeleton";
import { TeamsGrid } from "@/sections/TeamsGrid";

export default function Home() {
  return (
    <main className="bg-[var(--color-bg-primary)] min-h-screen">
      <Suspense fallback={<div className="h-[500px] bg-white/5 animate-pulse rounded-sm" />}>
        <HeroRace />
      </Suspense>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Suspense fallback={<TableSkeleton rows={5} />}>
              <StandingsWidget />
            </Suspense>
          </div>
          
          <div className="lg:col-span-1">
            <Suspense fallback={<CardSkeleton />}>
              <LastRaceCard />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <PredictionCTA />
          </div>
        </div>
      </section>
      
      <Suspense fallback={<div className="h-[600px] bg-white/5 animate-pulse rounded-sm" />}>
        <TeamsGrid />
      </Suspense>

      {/* Quick Links Section */}
      <section className="border-t border-white/5 py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-display font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic mb-4">
                Apex <span className="text-[var(--color-f1-red)]">Archive</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] font-medium leading-relaxed">
                Access over 70 years of Formula 1 history. Every driver, every constructor, every lap. 
                Our archive is powered by production-grade infrastructure and high-fidelity data feeds.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="border border-white/20 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 hover:bg-white/5 transition-ui rounded-sm">
                Drivers Database
              </button>
              <button className="border border-white/20 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 hover:bg-white/5 transition-ui rounded-sm">
                Constructor History
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
