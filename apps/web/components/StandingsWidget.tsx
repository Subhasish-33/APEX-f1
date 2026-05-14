import Link from "next/link";
import { api } from "@/lib/api";

export default async function StandingsWidget() {
  const year = 2024;
  const standings = await api.getSeasonStandings(year);
  const top5 = standings.data.slice(0, 5);

  return (
    <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-white font-black uppercase tracking-tighter text-lg italic">
          Driver <span className="text-f1-red">Standings</span>
        </h3>
        <Link href="/standings" className="text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors">
          View All
        </Link>
      </div>

      {standings.freshness && (
        <div className="px-6 py-2 bg-f1-red/5 border-b border-f1-red/10 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-f1-red animate-pulse shadow-[0_0_8px_rgba(255,24,1,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-f1-red/80">APEX Intelligence • Live Truth</span>
           </div>
           <span className="text-[8px] font-bold text-gray-400 uppercase tabular-nums">
              Pulsed: {new Date(standings.freshness).toLocaleTimeString()}
           </span>
        </div>
      )}

      <div className="divide-y divide-white/5 flex-grow">
        {top5.length > 0 ? (
          top5.map((entry, i) => (
            <div key={entry.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
              {i === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-f1-red" />}
              <span className={`w-6 font-black text-sm italic ${i === 0 ? "text-f1-red" : "text-gray-500"}`}>
                {entry.position}
              </span>
              <div className="flex-grow">
                <span className="block text-white font-bold text-sm uppercase group-hover:text-f1-red transition-all duration-300">
                  {entry.driver?.forename} {entry.driver?.surname}
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider opacity-70">
                  {entry.driver?.nationality}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-white font-black text-sm tabular-nums">{entry.points}</span>
                <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">PTS</span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-600 tracking-widest block mb-2">Awaiting Data Streams</span>
            <div className="w-12 h-0.5 bg-white/10 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
