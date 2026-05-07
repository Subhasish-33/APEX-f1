import { Suspense } from "react";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import TeamColorBadge from "@/components/TeamColorBadge";
import { CardSkeleton } from "@/components/Skeleton";
import SeasonSelector from "@/components/SeasonSelector";
import { getTeamLogo } from "@/lib/constants/assets";

export default async function TeamsPage({
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
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-f1-red">Constructor Championship</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
              F1 <span className="text-f1-red">Teams</span>
            </h1>
          </div>
          <SeasonSelector currentYear={year} />
        </header>

        <Suspense key={year} fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"><CardSkeleton /></div>}>
          <TeamsGrid year={year} />
        </Suspense>
      </div>
    </div>
  );
}

async function TeamsGrid({ year }: { year: number }) {
  const standings = await api.getSeasonConstructorStandings(year);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {standings.data.map((entry) => (
        <Link 
          href={`/teams/${entry.constructor?.constructor_ref}`} 
          key={entry.id}
          className="group relative bg-white/5 border border-white/10 rounded-sm overflow-hidden hover:border-f1-red/50 transition-all hover:translate-y-[-4px]"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="relative w-20 h-20">
                <Image
                  src={getTeamLogo(entry.constructor?.constructor_ref || "", year)}
                  alt={entry.constructor?.name || ""}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-right">
                <span className="block text-white font-black text-3xl leading-none italic">{entry.position}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rank</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-f1-red transition-colors mb-2">
              {entry.constructor?.name}
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">
              {entry.constructor?.nationality}
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div>
                <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Points</span>
                <span className="text-xl text-white font-black">{entry.points}</span>
              </div>
              <div>
                <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Wins</span>
                <span className="text-xl text-white font-black">{entry.wins}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/[0.02] px-8 py-4 flex justify-between items-center group-hover:bg-f1-red/10 transition-colors">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">View Team Profile</span>
            <svg className="w-4 h-4 text-f1-red transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
