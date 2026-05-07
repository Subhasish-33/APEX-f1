import { api } from "@/lib/api";
import CountdownTimer from "./CountdownTimer";

export default async function HeroRace() {
  const year = 2023; // In a real app, this would be dynamic
  const racesData = await api.getSeasonRaces(year);
  const now = new Date();
  
  // Find the next race or use the last one for demo
  const nextRace = racesData.data.find(r => new Date(r.date) > now) || racesData.data[racesData.data.length - 1];
  const isPast = new Date(nextRace.date) < now;

  return (
    <div className="relative bg-f1-dark py-16 sm:py-24 border-b border-white/5 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-f1-red/10 to-transparent skew-x-12 transform translate-x-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-f1-red text-white text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm">
                Next Grand Prix
              </span>
              <div className="h-px w-12 bg-white/20" />
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter mb-4 italic">
              {nextRace.name.split(' ')[0]} <span className="text-f1-red">{nextRace.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl font-medium mb-8 max-w-xl">
              Round {nextRace.round} of the {nextRace.year} FIA Formula One World Championship. 
              The pinnacle of motorsport returns to {nextRace.circuit_id.replace('_', ' ')}.
            </p>
            
            <div className="flex flex-wrap gap-x-12 gap-y-6">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Date</span>
                <span className="text-xl text-white font-bold">{new Date(nextRace.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Track</span>
                <span className="text-xl text-white font-bold uppercase">{nextRace.circuit_id.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="bg-white/5 border border-white/10 p-8 sm:p-10 rounded-sm backdrop-blur-md">
              <span className="block text-center text-[10px] uppercase tracking-[0.3em] text-f1-red font-black mb-6">Lights Out In</span>
              <CountdownTimer targetDate={isPast ? "2024-05-19T13:00:00Z" : nextRace.date} />
              <button className="w-full mt-10 bg-white text-f1-dark font-black uppercase tracking-widest py-4 text-xs hover:bg-f1-red hover:text-white transition-all">
                Full Weekend Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
