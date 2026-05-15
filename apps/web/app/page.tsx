import { Suspense } from "react";
import Link from "next/link";
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

      <section className="border-b border-white/10 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[10px] font-black uppercase tracking-[0.22em]">
            <span className="text-[var(--color-f1-red)]">Race Hub</span>
            <span>Schedule</span>
            <span>Results</span>
            <span>Standings</span>
            <span>Live</span>
          </div>
          <Link href="/calendar" className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55 hover:text-black transition-ui">
            Open Full Season Calendar
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <SectionKicker label="Command Surface" title="Race Week Operating Desk" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-10">
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

      <LatestCoverage />
      
      <Suspense fallback={<div className="h-[600px] bg-white/5 animate-pulse rounded-sm" />}>
        <TeamsGrid />
      </Suspense>

      <section className="border-t border-white/10 py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="max-w-2xl">
              <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-f1-red)] mb-5">
                Season Memory
              </span>
              <h2 className="text-5xl sm:text-7xl font-display font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic mb-6 leading-none">
                Apex <span className="text-[var(--color-f1-red)]">Archive</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] font-medium leading-relaxed">
                A long-range data warehouse for drivers, constructors, circuits, results, and future simulation layers.
                The archive is intentionally conservative: certified records first, modeled intelligence second.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/drivers" className="border border-white/20 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 hover:bg-white hover:text-black transition-ui rounded-sm">
                Drivers Database
              </Link>
              <Link href="/teams" className="border border-white/20 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 hover:bg-white hover:text-black transition-ui rounded-sm">
                Constructor History
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionKicker({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-f1-red)] mb-4">
          {label}
        </span>
        <h2 className="text-4xl sm:text-6xl font-display font-black uppercase italic tracking-tighter leading-none text-white">
          {title}
        </h2>
      </div>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)] leading-relaxed">
        Operational cards expose certified standings, archived results, prediction readiness, and live-state availability.
      </p>
    </div>
  );
}

function LatestCoverage() {
  const modules = [
    { label: "Breaking", title: "News ingestion pipeline pending", href: "/news" },
    { label: "Technical", title: "Car development briefs will attach to team pages", href: "/teams" },
    { label: "Race Control", title: "Live incident coverage activates only on certified feeds", href: "/live" },
  ];

  return (
    <section className="border-y border-white/10 bg-[#f5f5f5] text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-f1-red)] mb-4">
              Latest Coverage
            </span>
            <h2 className="text-5xl sm:text-7xl font-display font-black uppercase italic tracking-tighter leading-none">
              Newsroom Coming Online
            </h2>
            <p className="mt-6 text-sm text-black/55 leading-relaxed max-w-sm">
              The visual rail is ready for source-governed news, summaries, and race-week briefs. It will stay empty until content rights and source attribution are wired.
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {modules.map((item) => (
              <Link key={item.label} href={item.href} className="group min-h-72 border border-black/10 bg-white p-5 flex flex-col justify-between hover:border-[var(--color-f1-red)] transition-ui">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-f1-red)]">
                    {item.label}
                  </span>
                  <h3 className="mt-5 text-2xl font-display font-black uppercase italic tracking-tighter leading-none">
                    {item.title}
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 group-hover:text-black transition-ui">
                  View Module
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
