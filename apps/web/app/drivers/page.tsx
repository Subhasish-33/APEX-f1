import { Suspense } from "react";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { TableSkeleton } from "@/components/Skeleton";
import DriverIntro from "@/components/DriverIntro";
import SeasonSelector from "@/components/SeasonSelector";
import { getDriverHeadshot } from "@/lib/constants/assets";

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam) : 2024;

  return (
    <div className="bg-f1-dark min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-f1-red" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-f1-red">The Grid</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
              F1 <span className="text-f1-red">Drivers</span>
            </h1>
          </div>
          <SeasonSelector currentYear={year} />
        </header>

        <DriverIntro />

        <Suspense key={year} fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"><div className="h-64 bg-white/5 animate-pulse rounded-sm" /></div>}>
          <DriversGrid year={year} />
        </Suspense>
      </div>
    </div>
  );
}

async function DriversGrid({ year }: { year: number }) {
  const standings = await api.getSeasonStandings(year);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {standings.data.map((entry) => (
        <Link 
          href={`/drivers/${entry.driver?.driver_ref}`} 
          key={entry.id}
          className="group relative bg-white/5 border border-white/10 rounded-sm overflow-hidden hover:border-f1-red/50 transition-all hover:translate-y-[-4px]"
        >
          <div className="relative h-48 w-full bg-gradient-to-br from-white/5 to-transparent">
            <Image
              src={getDriverHeadshot(entry.driver?.driver_ref || "", year)}
              alt={entry.driver?.surname || ""}
              fill
              className="object-contain object-bottom transition-transform duration-500 group-hover:scale-110"
              sizes="(max-w-768px) 100vw, 25vw"
              priority={entry.position <= 4}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-f1-dark/80 to-transparent" />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl font-black italic text-white/10 group-hover:text-f1-red/20 transition-colors">
                {entry.position}
              </span>
              <div className="text-right">
                <span className="block text-white font-black text-xl leading-none">{entry.points}</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Points</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-f1-red transition-colors">
              {entry.driver?.forename} <span className="block font-black text-2xl leading-none mt-1">{entry.driver?.surname}</span>
            </h3>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {entry.driver?.nationality}
              </span>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-f1-red group-hover:border-f1-red transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Accent line */}
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-f1-red group-hover:w-full transition-all duration-300" />
        </Link>
      ))}
    </div>
  );
}
