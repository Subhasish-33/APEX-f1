"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { SeasonIntelligence, Driver } from "@apex/types";
import { SeasonSelector } from "../../components/SeasonSelector";
import { Activity, Zap, Layers, BarChart3, Info } from "lucide-react";

export default function SeasonIntelligenceDashboard() {
  const [year, setYear] = useState(2025);
  const [intel, setIntel] = useState<SeasonIntelligence | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [intelData, driversData] = await Promise.all([
          api.getSeasonIntelligence(year),
          api.getSeasonStandings(year).then((s) => s.data.map((item) => item.driver!)),
        ]);
        setIntel(intelData);
        setDrivers(driversData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [year]);

  if (loading || !intel) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Activity className="w-12 h-12 text-[var(--color-f1-red)] animate-spin" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black tracking-[0.5em] text-[var(--color-text-muted)] uppercase">
              Analyzing Season Data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pt-32 pb-40 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 relative z-10">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[var(--color-f1-red)]">
              <Layers size={20} />
              <span className="text-xs font-black tracking-[0.5em] uppercase italic">
                Championship Analytics
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-none">
              Season <span className="text-white/20">Analysis</span> {year}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <SeasonSelector currentYear={year} />
            <div className="h-12 w-px bg-white/10 hidden md:block" />
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                Season_DNA
              </span>
              <span className="text-xs font-black uppercase italic text-[var(--color-f1-red)]">
                {intel.dna}
              </span>
            </div>
          </div>
        </div>

        {/* Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-[var(--color-bg-secondary)] border border-white/5 p-8 rounded-sm">
            <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-4 block">
              Tension Score
            </span>
            <div className="text-6xl font-black italic font-data text-[var(--color-f1-red)]">
              {Math.round(intel.tension_score)}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-4 leading-relaxed">
              Real-time volatility tracking based on points swings and finish proximity.
            </p>
          </div>

          <div className="bg-[var(--color-bg-secondary)] border border-white/5 p-8 rounded-sm col-span-2">
            <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-4 block">
              Key Storylines
            </span>
            <div className="space-y-4">
              {intel.storylines.map((story, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-sm">
                  <Zap size={14} className="text-[var(--color-f1-red)] shrink-0 mt-1" />
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {story}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Control Grid - Placeholder for real charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-12">
            <div className="bg-[var(--color-bg-secondary)] border border-white/5 rounded-sm p-12 flex flex-col items-center justify-center text-center space-y-6">
              <BarChart3 size={48} className="text-white/10" />
              <div className="space-y-2">
                <h3 className="text-xl font-black italic uppercase">Analytics Visualizer</h3>
                <p className="text-xs text-[var(--color-text-muted)] font-medium max-w-xs mx-auto">
                  Championship velocity and volatility heatmaps are currently being calibrated for the 2025 data stream.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[var(--color-text-muted)] text-[10px] font-bold tracking-[0.3em] px-12">
        <div className="flex items-center gap-3">
          <Zap size={14} className="text-[var(--color-f1-red)]" />
          <span>APEX ANALYTICS ENGINE v1.0</span>
        </div>
        <div className="flex gap-10 uppercase">
          <span>Stochastic Models</span>
          <span>Rivalry Logic</span>
        </div>
      </footer>
    </main>
  );
}
