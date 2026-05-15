import { api } from "@/lib/api";
import CountdownTimer from "./CountdownTimer";
import Link from "next/link";

export default async function HeroRace() {
  const year = 2025;
  const racesData = await api.getSeasonRaces(year);
  const raceList = racesData?.data ?? [];
  const now = new Date();
  
  // Find the next race or use the last one for demo
  const nextRace = raceList.find(r => r?.date && new Date(r.date) > now) || raceList[raceList.length - 1];
  
  if (!nextRace) {
    return (
      <div className="relative bg-[var(--color-bg-primary)] py-32 border-b border-white/5 overflow-hidden flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--color-f1-red)] italic mb-4 block">Signal Lost</span>
        <h2 className="text-white font-display font-black text-4xl uppercase italic tracking-widest">No Active Telemetry</h2>
      </div>
    );
  }

  const isPast = new Date(nextRace.date) < now;

  const titleParts = nextRace?.name?.split(" ") ?? ["Apex", "Grand", "Prix"];

  return (
    <section className="relative min-h-[calc(100vh-7.25rem)] overflow-hidden bg-black border-b border-white/10">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_42%,rgba(0,0,0,0.16)_100%)]" />
      <div className="absolute inset-0 telemetry-grid opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto min-h-[calc(100vh-7.25rem)] px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="bg-[var(--color-f1-red)] text-white text-[10px] font-black uppercase tracking-[0.22em] px-3 py-1 rounded-sm italic">
                {isPast ? "Latest Grand Prix" : "Next Grand Prix"}
              </span>
              <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
                Round {nextRace?.round ?? "–"} / {nextRace?.year ?? "2025"}
              </span>
            </div>

            <h1 className="max-w-5xl text-6xl sm:text-8xl lg:text-[9rem] font-display font-black text-white uppercase tracking-tighter italic leading-[0.8]">
              {titleParts[0]} <span className="text-[var(--color-f1-red)]">{titleParts.slice(1).join(" ")}</span>
            </h1>

            <p className="mt-8 text-white/72 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
              Race-week intelligence for {nextRace?.circuit?.name ?? nextRace?.circuit_id?.replace("_", " ") ?? "the active circuit"}.
              Certified schedules, standings, results, and live-state semantics in one operating surface.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/calendar" className="bg-white text-black font-black uppercase tracking-widest px-7 py-4 text-xs hover:bg-[var(--color-f1-red)] hover:text-white transition-ui rounded-sm">
                Weekend Schedule
              </Link>
              <Link href="/live" className="border border-white/25 text-white font-black uppercase tracking-widest px-7 py-4 text-xs hover:bg-white hover:text-black transition-ui rounded-sm">
                Live Center
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 border border-white/15 bg-black/55 backdrop-blur-md rounded-sm">
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--color-f1-red)] font-black italic">
                {isPast ? "Archive Access" : "Lights Out In"}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">
                {nextRace?.date ? new Date(nextRace.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase() : "TBC"}
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <CountdownTimer targetDate={nextRace.date} />
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-white/35 font-black mb-2">Circuit</span>
                  <span className="text-white font-display font-black italic uppercase">{nextRace?.circuit?.location ?? "TBC"}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-white/35 font-black mb-2">State</span>
                  <span className="text-white font-display font-black italic uppercase">{isPast ? "Archived" : "Scheduled"}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
