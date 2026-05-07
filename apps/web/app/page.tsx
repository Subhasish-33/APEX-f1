import { Suspense } from "react";
import HeroRace from "@/components/HeroRace";
import StandingsWidget from "@/components/StandingsWidget";
import LastRaceCard from "@/components/LastRaceCard";
import PredictionCTA from "@/components/PredictionCTA";
import { CardSkeleton, TableSkeleton } from "@/components/Skeleton";
import { TeamsGrid } from "@/sections/TeamsGrid";


export default function Home() {
  return (
    <div className="bg-f1-dark min-h-screen">
      <Suspense fallback={<div className="h-[500px] bg-white/5 animate-pulse" />}>
        <HeroRace />
      </Suspense>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
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
      
      <Suspense fallback={<div className="h-[600px] bg-white/5 animate-pulse" />}>
        <TeamsGrid />
      </Suspense>


      {/* Quick Links Section */}
      <section className="border-t border-white/5 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">
                Apex <span className="text-f1-red">Archive</span>
              </h2>
              <p className="text-gray-400 font-medium">
                Access over 70 years of Formula 1 history. Every driver, every constructor, every lap. 
                Our archive is powered by high-fidelity data and processed for real-time analysis.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] px-8 py-4 hover:bg-white/5 transition-all">
                Drivers Database
              </button>
              <button className="border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] px-8 py-4 hover:bg-white/5 transition-all">
                Constructor History
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
