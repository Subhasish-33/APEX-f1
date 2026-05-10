import { Suspense } from "react";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import SeasonSelector from "@/components/SeasonSelector";
import { getDriverHeadshot } from "@/lib/constants/assets";
import { ChevronRight } from "lucide-react";

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam) : 2025;

  return (
    <main className="bg-[var(--color-bg-primary)] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-12 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] bg-[var(--color-f1-red)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--color-f1-red)]">The Grid</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-display font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic leading-none">
              F1 <span className="text-[var(--color-f1-red)]">Drivers</span>
            </h1>
          </div>
          <Suspense fallback={<div className="h-10 w-32 bg-white/5 animate-pulse rounded-sm" />}>
            <SeasonSelector currentYear={year} />
          </Suspense>
        </header>

        <Suspense 
          key={year} 
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="h-96 bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          }
        >
          <DriversGrid year={year} />
        </Suspense>
      </div>
    </main>
  );
}

async function DriversGrid({ year }: { year: number }) {
  const standings = await api.getSeasonStandings(year);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {standings.data.map((entry) => (
        <Link 
          href={`/drivers/${entry.driver?.driver_ref}`} 
          key={entry.id}
          className="group relative bg-[var(--color-bg-secondary)] border border-white/5 rounded-sm overflow-hidden hover:border-[var(--color-f1-red)]/50 transition-ui hover:translate-y-[-4px]"
        >
          <div className="relative h-56 w-full bg-gradient-to-br from-white/5 to-transparent">
            <Image
              src={getDriverHeadshot(entry.driver?.driver_ref || "", year)}
              alt={entry.driver?.surname || ""}
              fill
              className="object-contain object-bottom transition-transform duration-700 group-hover:scale-105"
              sizes="(max-w-768px) 100vw, 25vw"
              priority={entry.position <= 4}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)]/80 to-transparent" />
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <span className="text-5xl font-display font-black italic text-white/5 group-hover:text-[var(--color-f1-red)]/20 transition-ui">
                {entry.position}
              </span>
              <div className="text-right">
                <span className="block text-[var(--color-text-primary)] font-black text-2xl leading-none font-data italic">{entry.points}</span>
                <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-[0.2em]">Championship Points</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] uppercase tracking-tight group-hover:text-[var(--color-f1-red)] transition-ui">
              {entry.driver?.forename} <span className="block font-display font-black text-3xl leading-none mt-1">{entry.driver?.surname}</span>
            </h3>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest italic">
                {entry.driver?.nationality}
              </span>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-[var(--color-f1-red)] group-hover:border-[var(--color-f1-red)] transition-ui">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--color-f1-red)] group-hover:w-full transition-all duration-500" />
        </Link>
      ))}
    </div>
  );
}
