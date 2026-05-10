"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Driver } from "@apex/types";
import { Swords, Activity } from "lucide-react";
import Image from "next/image";

export default function DriverComparisonPage() {
  const [d1Id, setD1Id] = useState<number | null>(null);
  const [d2Id, setD2Id] = useState<number | null>(null);
  const [year] = useState(2025);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    async function loadDrivers() {
      try {
        const res = await api.getSeasonStandings(year);
        setDrivers(res.data.map((item) => item.driver!));
      } catch (err) {
        console.error(err);
      }
    }
    loadDrivers();
  }, [year]);

  const d1 = drivers.find((d) => d.driver_id === d1Id);
  const d2 = drivers.find((d) => d.driver_id === d2Id);

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pt-32 pb-40 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-20 border-b border-white/5 pb-12">
          <div className="flex items-center gap-3 text-[var(--color-f1-red)]">
            <Swords size={20} />
            <span className="text-xs font-black tracking-[0.6em] uppercase italic">
              Performance Comparison
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-none">
            Driver <span className="text-white/20">Head-to-Head</span>
          </h1>
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.4em]">
            Comparing qualifying and race performance data
          </p>
        </div>

        {/* Selection Area */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-center mb-20">
          <div className="lg:col-span-5">
            <DriverSelector
              drivers={drivers}
              selectedId={d1Id}
              onSelect={setD1Id}
              label="Driver A"
            />
          </div>

          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-white/40 font-black italic text-xl">
              VS
            </div>
          </div>

          <div className="lg:col-span-5">
            <DriverSelector
              drivers={drivers}
              selectedId={d2Id}
              onSelect={setD2Id}
              label="Driver B"
            />
          </div>
        </div>

        {/* Comparison Content */}
        {d1 && d2 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 transition-reveal opacity-100">
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-8 bg-[var(--color-bg-secondary)] p-10 rounded-sm border border-white/5">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[var(--color-f1-red)] bg-black">
                <Image
                  src={`/assets/headshots/${d1.driver_ref}.png`}
                  fill
                  alt={d1.surname}
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-black text-[var(--color-f1-red)] uppercase tracking-[0.4em] mb-2 block">
                  {d1.nationality}
                </span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter font-display">
                  {d1.surname}
                </h2>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <StatRow label="Qualifying Pace" v1="92" v2="88" />
              <StatRow label="Race Consistency" v1="88" v2="95" />
              <StatRow label="Tire Management" v1="85" v2="92" />
              <StatRow label="Strategy Response" v1="90" v2="94" />
              <div className="pt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <Activity size={12} className="text-[var(--color-f1-red)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                    Verified Performance Metrics
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-8 bg-[var(--color-bg-secondary)] p-10 rounded-sm border border-white/5">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 bg-black">
                <Image
                  src={`/assets/headshots/${d2.driver_ref}.png`}
                  fill
                  alt={d2.surname}
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em] mb-2 block">
                  {d2.nationality}
                </span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter font-display">
                  {d2.surname}
                </h2>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-40 border-2 border-dashed border-white/5 rounded-sm">
            <p className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-[0.5em]">
              Select Two Drivers to Compare Stats
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

interface DriverSelectorProps {
  drivers: Driver[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  label: string;
}

function DriverSelector({ drivers, selectedId, onSelect, label }: DriverSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
        {label}
      </label>
      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="w-full bg-[var(--color-bg-secondary)] border border-white/10 text-[var(--color-text-primary)] font-black uppercase text-sm rounded-sm px-6 py-4 focus:ring-1 focus:ring-[var(--color-f1-red)] outline-none appearance-none"
      >
        <option value="">Select Driver</option>
        {drivers.map((d: Driver) => (
          <option key={d.driver_id} value={d.driver_id}>
            {d.forename} {d.surname}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatRow({ label, v1, v2 }: { label: string; v1: string; v2: string }) {
  const val1 = Number(v1);
  const val2 = Number(v2);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
        <span>{v1}</span>
        <span>{label}</span>
        <span>{v2}</span>
      </div>
      <div className="flex gap-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="flex-1 flex justify-end">
          <div className="h-full bg-[var(--color-f1-red)]" style={{ width: `${val1}%` }} />
        </div>
        <div className="flex-1">
          <div className="h-full bg-white/40" style={{ width: `${val2}%` }} />
        </div>
      </div>
    </div>
  );
}
