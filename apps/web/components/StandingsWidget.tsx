import Link from "next/link";
import { api } from "@/lib/api";

export default async function StandingsWidget() {
  const year = 2023;
  const standings = await api.getSeasonStandings(year);
  const top5 = standings.data.slice(0, 5);

  return (
    <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-white font-black uppercase tracking-tighter text-lg italic">
          Driver <span className="text-f1-red">Standings</span>
        </h3>
        <Link href="/standings" className="text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors">
          View All
        </Link>
      </div>
      <div className="divide-y divide-white/5">
        {top5.map((entry, i) => (
          <div key={entry.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
            <span className={`w-6 font-black text-sm italic ${i === 0 ? "text-f1-red" : "text-gray-500"}`}>
              {entry.position}
            </span>
            <div className="flex-grow">
              <span className="block text-white font-bold text-sm uppercase group-hover:text-f1-red transition-colors">
                {entry.driver?.forename} {entry.driver?.surname}
              </span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                {entry.driver?.nationality}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-white font-black text-sm">{entry.points}</span>
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">PTS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
