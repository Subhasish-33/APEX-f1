import { api } from "@/lib/api";
import CountdownTimer from "./CountdownTimer";

export default async function HeroRace() {
  const year = 2025;
  const racesData = await api.getSeasonRaces(year);
  const now = new Date();
  
  // Find the next race or use the last one for demo
  const nextRace = racesData.data.find(r => new Date(r.date) > now) || racesData.data[racesData.data.length - 1];
  
  if (!nextRace) {
    return (
      <div className="relative bg-[var(--color-bg-primary)] py-32 border-b border-white/5 overflow-hidden flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--color-f1-red)] italic mb-4 block">Signal Lost</span>
        <h2 className="text-white font-display font-black text-4xl uppercase italic tracking-widest">No Active Telemetry</h2>
      </div>
    );
  }

  const isPast = new Date(nextRace.date) < now;

  return (
    <div className="relative bg-[var(--color-bg-primary)] py-16 sm:py-32 border-b border-white/5 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-f1-red)]/10 to-transparent skew-x-12 transform translate-x-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[var(--color-f1-red)] text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-sm italic">
                {isPast ? "Latest Grand Prix" : "Next Grand Prix"}
              </span>
              <div className="h-[1px] w-12 bg-white/20" />
            </div>
            <h1 className="text-5xl sm:text-8xl font-display font-black text-[var(--color-text-primary)] uppercase tracking-tighter mb-6 italic leading-tight">
              {nextRace.name.split(' ')[0]} <span className="text-[var(--color-f1-red)]">{nextRace.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg sm:text-xl font-medium mb-10 max-w-xl leading-relaxed">
              Round {nextRace.round} of the {nextRace.year} World Championship. 
              The pinnacle of motorsport continues at the {nextRace.circuit?.name ?? nextRace.circuit_id.replace('_', ' ')}.
            </p>
            
            <div className="flex flex-wrap gap-x-16 gap-y-8">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-black mb-2 italic">Scheduled Date</span>
                <span className="text-2xl text-[var(--color-text-primary)] font-black italic font-data">
                  {new Date(nextRace.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-black mb-2 italic">Circuit DNA</span>
                <span className="text-2xl text-[var(--color-text-primary)] font-black italic uppercase font-display">
                  {nextRace.circuit?.location ?? "Global Circuit"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="bg-[var(--color-bg-secondary)] border border-white/10 p-8 sm:p-12 rounded-sm backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-f1-red)] opacity-40" />
              <span className="block text-center text-[10px] uppercase tracking-[0.4em] text-[var(--color-f1-red)] font-black mb-8 italic">
                {isPast ? "Archive Access" : "Lights Out In"}
              </span>
              <CountdownTimer targetDate={nextRace.date} />
              <button className="w-full mt-12 bg-white text-black font-black uppercase tracking-widest py-4 text-xs hover:bg-[var(--color-f1-red)] hover:text-white transition-ui rounded-sm">
                Full Weekend Intel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
