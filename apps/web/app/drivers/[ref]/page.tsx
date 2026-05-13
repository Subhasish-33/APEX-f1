import { api } from "@/lib/api";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trophy, Flag, Timer, Zap, Activity, Target } from "lucide-react";
import { getTeamTheme } from "@/lib/drivers/driver-theme-map";
import { getDriverIdentity } from "@/lib/drivers/driver-identity-map";
import { getDriverMedia } from "@/lib/driver-media";
import { getDriverBio } from "@/lib/drivers/driver-bios";
import DriverImage from "@/components/media/DriverImage";
import NationalityFlag from "@/components/NationalityFlag";
import CareerPerformanceChart from "@/components/CareerPerformanceChart";
import RecentForm from "@/components/RecentForm";
import SectorOverlay from "@/components/media/SectorOverlay";
import ScanBar from "@/components/media/ScanBar";
import TimingFrame from "@/components/media/TimingFrame";
import { cn } from "@/lib/utils";

export const revalidate = 3600; 

export async function generateStaticParams() {
  const drivers = await api.getDrivers(1, 100);
  return drivers.data.map((d) => ({
    ref: d.driver_ref,
  }));
}

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  let driver;
  
  try {
    driver = await api.getDriver(ref);
  } catch (e) {
    return notFound();
  }

  const [career, results, teammateDuel] = await Promise.all([
    api.getDriverCareer(ref),
    api.getDriverResults(ref, 5),
    api.getTeammateDuel(ref, 2024)
  ]);

  const theme = getTeamTheme(results[0]?.constructor?.constructor_ref);
  const identity = getDriverIdentity(ref);
  const media = getDriverMedia(ref);
  const bio = getDriverBio(ref);

  const careerTotals = career.reduce((acc, curr) => ({
    wins: acc.wins + curr.wins,
    podiums: acc.podiums + curr.podiums,
    poles: acc.poles + curr.poles,
    points: acc.points + curr.points
  }), { wins: 0, podiums: 0, poles: 0, points: 0 });

  return (
    <main className="bg-[var(--color-bg-primary)] min-h-screen relative overflow-hidden">
      {/* GLOBAL ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-30 telemetry-noise mix-blend-overlay" />
      
      {/* PHASE 2 - SECTION A: CINEMATIC HERO */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Layered Background Architecture */}
        <div 
          className="absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-mechanical" 
          style={{ 
            background: `radial-gradient(circle at 70% 30%, ${theme.primary}33 0%, transparent 70%), ${theme.gradient}` 
          }} 
        />
        <SectorOverlay className="opacity-20 z-1" />
        <ScanBar className="top-0 left-0 w-full h-full z-2 opacity-5" speed={8} />
        <div className="absolute inset-0 z-3 telemetry-grid opacity-20" />

        {/* Architectural Backdrop Typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-4 pointer-events-none overflow-hidden w-full text-center">
           <span className="text-display-4 font-display font-black text-white/5 italic tracking-tighter-extreme select-none leading-none inline-block transform translate-y-12">
             {driver.number || "00"}
           </span>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 pb-20">
          <Link href="/drivers" className="inline-flex items-center gap-4 text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-[0.6em] mb-32 hover:text-white transition-all duration-500 group">
             <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform ease-mechanical" />
             Return to Sector Intelligence
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            {/* Identity Column */}
            <div className="lg:col-span-8 pb-12 relative">
               <div className="flex items-center gap-8 mb-12">
                  <div className="flex items-center gap-4">
                    <NationalityFlag nationality={driver.nationality} className="w-12 h-7 shadow-2xl" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">{driver.nationality}</span>
                  </div>
                  <span className="w-12 h-[1px] bg-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-f1-red)] italic animate-pulse">// {identity.tagline}</span>
               </div>
               
               <h1 className="relative">
                 <span className="text-4xl md:text-6xl block font-medium tracking-tighter text-[var(--color-text-secondary)] mb-4 uppercase">
                    {driver.forename}
                 </span>
                 <span className="text-display-2 md:text-display-3 font-display font-black text-white uppercase tracking-tighter-extreme leading-[0.75] italic block transform -translate-x-4">
                    {driver.surname}
                 </span>
               </h1>

               {/* Quick Stats Grid - Phase 1 Hierarchy */}
               <div className="flex flex-wrap gap-20 mt-20 pt-12 border-t border-white/5">
                 <HeroStat label="Victories" value={careerTotals.wins} />
                 <HeroStat label="Podiums" value={careerTotals.podiums} />
                 <HeroStat label="Pole Pos" value={careerTotals.poles} />
                 <div className="ml-auto text-right">
                    <span className="block text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em] mb-2">Championship Rank</span>
                    <span className="text-8xl font-display font-black italic text-white/10">{results[0]?.position || "—"}</span>
                 </div>
               </div>
            </div>

            {/* Dynamic Driver Framing */}
            <div className="lg:col-span-4 relative h-[600px] lg:h-[900px] group">
               <div 
                 className="absolute inset-0 z-10 opacity-40 group-hover:opacity-10 transition-opacity duration-1000"
                 style={{ background: `linear-gradient(to top, ${theme.secondary} 0%, transparent 50%)` }}
               />
               <DriverImage
                 src={media.hero}
                 blurSrc={media.blur}
                 alt={driver.surname}
                 fill
                 containerClassName="h-full w-full"
                 className="object-contain object-bottom transition-transform duration-[3000ms] ease-mechanical group-hover:scale-110"
                 priority
                 cropPosition="bottom"
               />
               <ScanBar direction="vertical" className="left-0 top-0 h-full w-20 opacity-10" speed={12} />
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 3 - PERFORMANCE DASHBOARD */}
      <section className="py-40 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Intelligence Box */}
            <div className="lg:col-span-8">
               <TimingFrame className="h-full">
                  <div className="p-12 telemetry-grid h-full">
                    <div className="flex justify-between items-start mb-16">
                       <div className="flex items-center gap-4">
                          <Activity className="text-[var(--color-f1-red)]" size={16} />
                          <h2 className="text-white font-display font-black text-2xl uppercase italic tracking-widest">Telemetry Trajectory</h2>
                       </div>
                       <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.6em]">System: APEX-CORTEX-04</span>
                    </div>
                    <div className="h-[400px]">
                       <CareerPerformanceChart data={career.map(c => ({
                          year: c.year,
                          position: 1, 
                          points: c.points
                       })).reverse()} />
                    </div>
                  </div>
               </TimingFrame>
            </div>

            {/* Recent Grid */}
            <div className="lg:col-span-4">
               <h3 className="text-white font-black uppercase tracking-[0.4em] text-[10px] mb-12 italic border-b border-white/10 pb-6">
                  // Recent Sector Analysis
               </h3>
               <RecentForm results={results} />
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 6 - EDITORIAL STORYTELLING */}
      <section className="py-40 bg-[var(--color-bg-secondary)] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-start">
            
            {/* Editorial Image Moment */}
            <div className="lg:col-span-5">
               <TimingFrame showMarkers={false} borderColor="transparent">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm group shadow-glass">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    <DriverImage
                      src={media.casual}
                      alt={driver.surname}
                      fill
                      className="object-cover grayscale transition-all duration-[2000ms] ease-mechanical group-hover:grayscale-0 group-hover:scale-110"
                    />
                    <div className="absolute bottom-12 left-12 z-20 max-w-xs">
                       <span className="block w-12 h-[2px] bg-[var(--color-f1-red)] mb-6" />
                       <p className="text-white font-display font-black text-5xl uppercase italic leading-none tracking-tighter-extreme">
                          {bio.motto}
                       </p>
                    </div>
                  </div>
               </TimingFrame>
            </div>

            {/* Immersive Narrative */}
            <div className="lg:col-span-7 space-y-24">
              {bio.sections.map((section, i) => (
                <div key={i} className="relative group">
                  <span className="absolute -left-12 top-0 text-7xl font-display font-black text-white/5 italic select-none group-hover:text-white/10 transition-colors">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-6 mb-8">
                    <h3 className="text-white font-display font-black text-3xl uppercase italic tracking-widest">{section.title}</h3>
                  </div>
                  <p className="text-2xl text-[var(--color-text-secondary)] leading-relaxed font-light first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-white">
                    {section.content}
                  </p>
                </div>
              ))}

              {/* Intra-Team Comparison - Phase 8 personality */}
              {teammateDuel && teammateDuel.teammate && (
                <div className="pt-24 border-t border-white/5">
                   <div className="flex items-center justify-between mb-12">
                      <h3 className="text-white font-display font-black text-xl uppercase italic tracking-widest">Machine Comparison</h3>
                      <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em]">Delta Ref: 2024.1.0</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-4">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Primary Subject</span>
                         <span className="text-3xl font-display font-black text-white italic block uppercase tracking-tighter">{driver.surname}</span>
                      </div>
                      <div className="space-y-4 text-right">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Baseline Reference</span>
                         <span className="text-3xl font-display font-black text-white italic block uppercase tracking-tighter">{teammateDuel.teammate.surname}</span>
                      </div>
                      <div className="md:col-span-2">
                        <DuelRow label="Race Performance" score={teammateDuel.race_h2h} color={theme.primary} />
                        <div className="h-12" />
                        <DuelRow label="Qualifying Pace" score={teammateDuel.qualifying_h2h} color={theme.primary} />
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em] mb-4 italic">// {label}</span>
      <span className="text-7xl font-display font-black italic text-white leading-none tracking-tighter-extreme transition-transform hover:translate-x-2 duration-500 ease-mechanical">
        {value}
      </span>
    </div>
  );
}

function DuelRow({ label, score, color }: { label: string; score: [number, number]; color: string }) {
  const total = score[0] + score[1];
  const percent = total > 0 ? (score[0] / total) * 100 : 50;

  return (
    <div>
      <div className="flex justify-between items-end mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{label}</span>
        <span className="text-lg font-display font-black text-white italic">{score[0]} — {score[1]}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
        <div 
          className="h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
          style={{ width: `${percent}%`, backgroundColor: color }} 
        />
        <div 
          className="h-full bg-white/20 transition-all duration-1000" 
          style={{ width: `${100 - percent}%` }} 
        />
      </div>
    </div>
  );
}
