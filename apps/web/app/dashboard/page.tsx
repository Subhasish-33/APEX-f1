"use client";

import { useState, useEffect, use } from "react";
import { api } from "../../lib/api";
import { SeasonIntelligence, Driver, Rivalry } from "@apex/types";
import { TitleTensionHUD } from "../../components/Analytics/TitleTensionHUD";
import { PressureHeatmap } from "../../components/Analytics/PressureHeatmap";
import { RivalryIntensityMatrix } from "../../components/Analytics/RivalryIntensityMatrix";
import { SimulationConsole } from "../../components/Analytics/SimulationConsole";
import { SeasonSelector } from "../../components/SeasonSelector";
import { Activity, Zap, Layers, BarChart3, Info, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SeasonIntelligenceDashboard() {
  const [year, setYear] = useState(2024);
  const [intel, setIntel] = useState<SeasonIntelligence | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSimulation, setActiveSimulation] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [intelData, driversData] = await Promise.all([
          api.getSeasonIntelligence(year),
          api.getSeasonRaces(year).then(res => {
              // Extract unique drivers from some source or just fetch all drivers
              // For demo, we'll fetch standings to get the active drivers
              return api.getSeasonStandings(year).then(s => s.data.map(item => item.driver!));
          })
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
      <div className="min-h-screen bg-f1-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Activity className="w-16 h-16 text-f1-red animate-spin" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">Orchestrating Narrative Intelligence...</span>
            <span className="text-[8px] font-bold text-f1-red mt-2 uppercase animate-pulse">Synchronizing Psychometric Data</span>
          </div>
        </div>
      </div>
    );
  }

  const atmosphere = getSeasonAtmosphere(intel.dna, intel.tension_score);

  return (
    <main className={`min-h-screen ${atmosphere.bg} text-white pt-32 pb-40 transition-colors duration-1000 overflow-x-hidden`}>
      {/* Background Intelligence Aura */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 ${atmosphere.overlay} opacity-10`} />
        <div className={`absolute top-[10%] left-[5%] w-[1000px] h-[1000px] ${atmosphere.glow} blur-[250px] rounded-full animate-pulse`} />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 relative z-10">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-f1-red">
                <Layers size={20} />
                <span className="text-xs font-black tracking-[0.5em] uppercase italic">Championship Intelligence OS</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Season <span className="text-white/20">Analysis</span> {year}
             </h1>
          </div>
          
          <div className="flex items-center gap-6">
             <SeasonSelector currentSeason={year} onSeasonChange={setYear} />
             <div className="h-12 w-px bg-white/10 hidden md:block" />
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Atmosphere_Mode</span>
                <span className={`text-xs font-black uppercase italic ${atmosphere.text}`}>{intel.dna}</span>
             </div>
          </div>
        </div>

        {/* The Narrative HUD */}
        <section className="mb-12">
          <TitleTensionHUD score={intel.tension_score} dna={intel.dna} storylines={intel.storylines} />
        </section>

        {/* Mission Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main Visualizers (8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            <PressureHeatmap pressureMap={intel.pressure_map} drivers={drivers} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <RivalryIntensityMatrix rivalries={intel.rivalries} drivers={drivers} />
               <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-6">
                  <BarChart3 size={48} className="text-white/10" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-black italic uppercase">Championship Velocity</h3>
                    <p className="text-xs text-white/30 font-medium max-w-xs mx-auto">
                      Advanced points progression and lead-swing analysis will be rendered here based on seasonal volatility.
                    </p>
                  </div>
                  <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Initiate Deep Scan
                  </button>
               </div>
            </div>
          </div>

          {/* Side Panels (4 Columns) */}
          <div className="lg:col-span-4 space-y-8">
             <SimulationConsole onSimulate={setActiveSimulation} />
             
             {/* Story of the Season Placeholder */}
             <div className="bg-gradient-to-br from-f1-red to-f1-red/40 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group cursor-pointer">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                   <Eye size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                     <Zap size={14} className="animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Flagship Mode</span>
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
                    THE STORY OF THE SEASON
                  </h3>
                  <p className="text-sm font-medium text-white/80 leading-relaxed">
                    Enter a guided cinematic experience that replays the season's arcs, turning points, and strategic collapses.
                  </p>
                  <div className="pt-4 flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white text-f1-red flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Info size={20} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Launch Cinematic Documentary</span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Predictive Footer */}
        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-[10px] font-bold tracking-[0.3em]">
           <div className="flex items-center gap-3">
              <Zap size={14} className="text-f1-gold" />
              <span>APEX NARRATIVE ENGINE v11.2 // STOCHASTIC READY</span>
           </div>
           <div className="flex gap-10 uppercase">
              <span className="hover:text-f1-red cursor-pointer transition-colors">Pressure Models</span>
              <span className="hover:text-f1-red cursor-pointer transition-colors">Rivalry Logic</span>
              <span className="hover:text-f1-red cursor-pointer transition-colors">Reality Simulation</span>
           </div>
        </footer>
      </div>

      {/* Replay of Simulation Shift */}
      <AnimatePresence>
        {activeSimulation.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-f1-gold text-black px-8 py-3 rounded-full shadow-2xl flex items-center gap-4 border-2 border-white/20"
          >
             <Zap size={18} className="animate-pulse" />
             <span className="text-sm font-black italic uppercase tracking-tighter">Reality Shift: {activeSimulation.length} Scenario(s) Active</span>
             <div className="h-4 w-px bg-black/20" />
             <span className="text-[10px] font-black uppercase">Championship Probability: FLUCTUATING</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function getSeasonAtmosphere(dna: string, tension: number) {
  if (dna === "Chaos Era" || tension > 80) {
    return {
      bg: "bg-[#0f0505]",
      overlay: "bg-f1-red",
      glow: "bg-f1-red",
      text: "text-f1-red shadow-[0_0_20px_rgba(225,6,0,0.4)]"
    };
  }
  if (dna === "Dominance Era" || tension < 30) {
    return {
      bg: "bg-[#05050f]",
      overlay: "bg-blue-900",
      glow: "bg-blue-600",
      text: "text-blue-400"
    };
  }
  return {
    bg: "bg-[#0a0a14]",
    overlay: "bg-f1-red",
    glow: "bg-f1-red",
    text: "text-f1-red"
  };
}
