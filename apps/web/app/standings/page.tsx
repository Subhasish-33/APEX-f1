import { Suspense } from "react";
import { api } from "@/lib/api";
import StandingsTable from "@/components/StandingsTable";
import SeasonSelector from "@/components/SeasonSelector";
import { TableSkeleton } from "@/components/Skeleton";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam) : 2023;

  return (
    <div className="bg-f1-dark min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-f1-red" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-f1-red">Official Rankings</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
              World <span className="text-f1-red">Championship</span>
            </h1>
          </div>
          <Suspense fallback={<div className="h-10 w-32 bg-white/5 animate-pulse" />}>
            <SeasonSelector currentYear={year} />
          </Suspense>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-sm p-2 sm:p-6">
              <Suspense key={year} fallback={<TableSkeleton rows={15} />}>
                <StandingsList year={year} />
              </Suspense>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Constructors</h3>
              </div>
              <Suspense key={`const-${year}`} fallback={<div className="p-6 space-y-4"><div className="h-4 w-full bg-white/5 animate-pulse" /></div>}>
                <ConstructorStandingsList year={year} />
              </Suspense>
            </div>
            
            <div className="bg-f1-red/10 border border-f1-red/20 p-6 rounded-sm">
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">Scoring System</h4>
              <p className="text-[10px] text-gray-400 leading-relaxed uppercase font-bold">
                25-18-15-12-10-8-6-4-2-1. <br/>
                +1 point for Fastest Lap if in top 10.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

async function StandingsList({ year }: { year: number }) {
  const data = await api.getSeasonStandings(year);
  return <StandingsTable data={data.data} />;
}

async function ConstructorStandingsList({ year }: { year: number }) {
  const data = await api.getSeasonConstructorStandings(year);
  return (
    <div className="divide-y divide-white/5">
      {data.data.map((entry) => (
        <div key={entry.id} className="px-6 py-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-f1-red italic w-4">{entry.position}</span>
            <span className="text-xs font-bold text-white uppercase">{entry.constructor?.name}</span>
          </div>
          <span className="text-xs font-black text-white">{entry.points} <span className="text-[8px] text-gray-500">PTS</span></span>
        </div>
      ))}
    </div>
  );
}
