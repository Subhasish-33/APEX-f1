import { api } from "@/lib/api";

export default async function LastRaceCard() {
  const year = 2023;
  const races = await api.getSeasonRaces(year);
  const raceData = races?.data ?? [];
  const pastRaces = raceData.filter(r => r?.date && new Date(r.date) < new Date());
  const lastRace = pastRaces[pastRaces.length - 1];
  
  if (!lastRace) return null;

  const detail = await api.getRace(lastRace.race_id);
  const results = detail?.results ?? [];
  const podium = [...results].sort((a, b) => (a.position || 99) - (b.position || 99)).slice(0, 3);

  return (
    <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-white font-black uppercase tracking-tighter text-lg italic">
          Last Race <span className="text-f1-red">Results</span>
        </h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{lastRace.name}</p>
      </div>
      
      <div className="flex-grow p-6 flex flex-col justify-center gap-6">
        {podium.map((result, i) => (
          <div key={result.result_id} className="flex items-center gap-6">
            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-sm font-black text-2xl italic
              ${i === 0 ? "bg-f1-gold text-f1-dark" : "bg-white/10 text-white"}
            `}>
              {i + 1}
            </div>
            <div>
              <span className="block text-white font-bold text-base uppercase tracking-tight">
                {result.driver?.forename} {result.driver?.surname}
              </span>
              <span className="text-xs text-gray-400 font-medium uppercase italic">
                {result.constructor?.name}
              </span>
            </div>
            <div className="ml-auto text-right">
              <span className="text-f1-red font-black text-lg">+{result.points}</span>
              <span className="block text-[8px] text-gray-500 font-bold">PTS</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-f1-red p-4 text-center">
        <span className="text-white font-black uppercase tracking-widest text-[10px]">
          View Full Race Analysis
        </span>
      </div>
    </div>
  );
}
