import { Suspense } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import SeasonSelector from "@/components/SeasonSelector";
import TimingFrame from "@/components/media/TimingFrame";
import SectorOverlay from "@/components/media/SectorOverlay";

import TelemetryLoading from "@/components/media/TelemetryLoading";

export const revalidate = 3600;

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam) : 2024;

  return (
    <main className="bg-[var(--color-bg-primary)] min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Global Backdrop Atmosphere */}
      <div className="absolute inset-0 telemetry-noise opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-20 border-b border-white/5 pb-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-[1px] bg-[var(--color-f1-red)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-[var(--color-f1-red)] italic">Grid Telemetry</span>
            </div>
            <h1 className="text-5xl sm:text-8xl font-display font-black text-white uppercase tracking-tighter italic leading-none">
              F1 <span className="text-outline">Drivers</span>
            </h1>
          </div>
          <Suspense fallback={<div className="h-10 w-32 bg-white/5 animate-pulse rounded-sm" />}>
            <SeasonSelector currentYear={year} />
          </Suspense>
        </header>

        <Suspense 
          key={year} 
          fallback={<TelemetryLoading />}
        >
          <DriversGrid year={year} />
        </Suspense>
      </div>
    </main>
  );
}

import NationalityFlag from "@/components/NationalityFlag";
import { getTeamTheme } from "@/lib/drivers/driver-theme-map";
import { getDriverIdentity } from "@/lib/drivers/driver-identity-map";
import { getDriverMedia } from "@/lib/driver-media";
import DriverImage from "@/components/media/DriverImage";
import { cn } from "@/lib/utils";

async function DriversGrid({ year }: { year: number }) {
  const standings = await api.getSeasonStandings(year);
  const data = standings?.data ?? [];
  
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-white/[0.02] rounded-sm p-12 text-center telemetry-grid">
        <SectorOverlay className="opacity-10" />
        <h2 className="text-xl font-display font-black tracking-[0.3em] text-white/40 uppercase mb-4 italic">Signal Lost</h2>
        <p className="text-white/20 max-w-xs font-data text-[10px] uppercase tracking-widest leading-relaxed">
          // No championship intelligence found for season {year}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
        {data.map((entry, index) => {
          const theme = getTeamTheme(entry.constructor?.constructor_ref);
          const identity = getDriverIdentity(entry.driver?.driver_ref);
          const media = getDriverMedia(entry.driver?.driver_ref);
          
          // PHASE 3: Editorial Rhythm Logic
          const isIconic = index < 2; // P1 & P2 get massive hero cards
          const isFeatured = index >= 2 && index < 4; // P3 & P4 get medium cards
          
          const colSpan = isIconic ? "lg:col-span-6" : 
                          isFeatured ? "lg:col-span-6" : "lg:col-span-4";

          return (
            <div key={entry.id} className={cn(colSpan, "group")}>
              <TimingFrame>
                <Link 
                  href={`/drivers/${entry.driver?.driver_ref}`} 
                  className={cn(
                    "relative block bg-[var(--color-bg-secondary)] overflow-hidden transition-all duration-700",
                    isIconic ? "min-h-[600px]" : "min-h-[420px]"
                  )}
                >
                  {/* Phase 4: Signature APEX Motif */}
                  <SectorOverlay className="opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div 
                    className="absolute inset-0 opacity-10 transition-opacity duration-1000 group-hover:opacity-30" 
                    style={{ background: theme.gradient }} 
                  />
                  <div className="absolute inset-0 telemetry-grid opacity-30" />
                  
                  {/* Phase 1: Architectural Typography */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                    <span className="text-display-4 font-display font-black text-white/5 italic tracking-tighter-extreme select-none leading-none group-hover:scale-110 group-hover:text-white/10 transition-transform duration-[2000ms] ease-mechanical">
                      {entry.driver?.surname?.slice(0, 3).toUpperCase() ?? "APX"}
                    </span>
                  </div>

                  <div className="relative flex flex-col h-full">
                    {/* Top Stats Layer */}
                    <div className="p-8 pb-0 flex justify-between items-start z-30">
                       <div className="flex items-center gap-3">
                         <span className="w-8 h-[1px] bg-[var(--color-f1-red)]" />
                         <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic leading-none">
                            {isIconic ? "Apex Elite" : `Sector ${index + 1}`}
                         </span>
                       </div>
                       <span className="text-4xl font-display font-black italic text-white/20 group-hover:text-white transition-colors duration-700 leading-none">
                          {(entry?.position ?? index + 1).toString().padStart(2, '0')}
                       </span>
                    </div>

                    {/* Media Container */}
                    <div className={cn(
                      "relative flex-1 overflow-hidden",
                      isIconic ? "mt-[-4rem]" : ""
                    )}>
                      <DriverImage
                        src={media.hero}
                        blurSrc={media.blur}
                        alt={entry.driver?.surname || ""}
                        fill
                        containerClassName="h-full w-full"
                        className="object-contain object-bottom group-hover:scale-105 transition-transform duration-[1500ms] ease-mechanical"
                        cropPosition="bottom"
                        priority={isIconic}
                        sizes={isIconic ? "50vw" : "33vw"}
                      />
                    </div>

                    {/* Identity Footer */}
                    <div className="relative z-30 p-8 pt-0 bg-gradient-to-t from-[var(--color-bg-secondary)] via-[var(--color-bg-secondary)]/80 to-transparent">
                       <NationalityFlag nationality={entry.driver?.nationality} className="w-6 h-4 mb-4" />
                       <h3 className="font-display font-black text-4xl xl:text-5xl uppercase italic leading-[0.85] tracking-tighter text-white mb-2">
                         <span className="text-sm block font-medium tracking-normal not-italic text-[var(--color-text-secondary)] mb-1">{entry.driver?.forename}</span>
                         {entry.driver?.surname}
                       </h3>
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] italic">
                         // {identity.tagline}
                       </p>
                       
                       <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{entry.constructor?.name}</span>
                          <span className="text-xl font-data font-black text-white italic">{entry.points ?? 0} pts</span>
                       </div>
                    </div>
                  </div>
                </Link>
              </TimingFrame>
            </div>
          );
        })}
      </div>

      {/* Phase 3: Editorial Separator moment */}
      <div className="py-20 border-y border-white/5 relative overflow-hidden bg-white/[0.01]">
         <SectorOverlay className="opacity-5" />
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="text-[var(--color-f1-red)] font-black text-[10px] uppercase tracking-[0.6em] mb-8 block italic">Engineered Excellence</span>
            <h2 className="text-white font-display font-black text-6xl xl:text-8xl uppercase italic tracking-tighter leading-none mb-12">
               Precision is the <br/> Only <span className="text-outline">Language</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm font-medium tracking-widest uppercase opacity-40">
               APEX Telemetry // Season 2024 Intelligence
            </p>
         </div>
      </div>
    </div>
  );
}
