"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Driver } from "@apex/types";
import { BattleSelector } from "../../components/Analytics/BattleSelector";
import { PsychometricRadar } from "../../components/Analytics/PsychometricRadar";
import { BreakingPointVisualizer } from "../../components/Analytics/BreakingPointVisualizer";
import { DuelScenarioEngine } from "../../components/Analytics/DuelScenarioEngine";
import { Swords, Zap, Activity, Info, TrendingUp, AlertCircle, ShieldHalf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function BattleIntelligenceOS() {
  const [d1Id, setD1Id] = useState<number | null>(null);
  const [d2Id, setD2Id] = useState<number | null>(null);
  const [year, setYear] = useState(2024);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [warfare, setWarfare] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<any>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    async function loadDrivers() {
      const res = await api.getSeasonStandings(year);
      setDrivers(res.data.map(item => item.driver!));
    }
    loadDrivers();
  }, [year]);

  useEffect(() => {
    if (d1Id && d2Id) {
      async function loadWarfare() {
        setLoading(true);
        setIsRevealed(false);
        try {
          const res = await api.getBattleWarfare(d1Id, d2Id, year, "monaco");
          setWarfare(res);
          setSimulation({
             winner: res.edge.winner_id === d1Id ? drivers.find(d => d.driver_id === d1Id)?.surname : drivers.find(d => d.driver_id === d2Id)?.surname,
             probability: res.edge.probability
          });
          
          // Cinematic Reveal Delay
          setTimeout(() => {
            setIsRevealed(true);
            setLoading(false);
          }, 1500);
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      }
      loadWarfare();
    }
  }, [d1Id, d2Id, year]);

  const d1 = drivers.find(d => d.driver_id === d1Id);
  const d2 = drivers.find(d => d.driver_id === d2Id);

  return (
    <main className="min-h-screen bg-f1-dark text-white pt-32 pb-40 overflow-x-hidden relative">
      {/* Background Combat Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-f1-red/10 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-f1-red/5 blur-[200px] rounded-full" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-20">
           <div className="flex items-center gap-3 text-f1-red">
              <Swords size={20} />
              <span className="text-xs font-black tracking-[0.6em] uppercase italic">Psychological Warfare Simulator</span>
           </div>
           <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
              BATTLE <span className="text-white/20">INTELLIGENCE</span> OS
           </h1>
           <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Stochastic Rivalry Analysis Engine v12.4</p>
        </div>

        {/* Selection Area */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mb-32">
           <BattleSelector 
             drivers={drivers} 
             selectedDriverId={d1Id} 
             onSelect={setD1Id} 
             label="Warrior Alpha" 
           />
           
           <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-white/40 font-black italic text-xl">VS</div>
              <div className="h-20 w-px bg-gradient-to-b from-white/10 to-transparent" />
           </div>

           <BattleSelector 
             drivers={drivers} 
             selectedDriverId={d2Id} 
             onSelect={setD2Id} 
             label="Warrior Beta" 
           />
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div 
               key="loading"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center py-20"
             >
                <Zap className="w-20 h-20 text-f1-red animate-pulse mb-8" />
                <span className="text-xs font-black tracking-[0.5em] text-f1-red uppercase animate-pulse">Synchronizing Behavioral DNA...</span>
             </motion.div>
          ) : isRevealed && warfare ? (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
               {/* Reveal Row */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Driver A Reveal */}
                  <div className="lg:col-span-3 flex flex-col items-center text-center space-y-6">
                     <motion.div 
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="relative w-64 h-64 rounded-[3rem] overflow-hidden border-4 border-f1-red shadow-[0_0_50px_rgba(225,6,0,0.3)] bg-black"
                     >
                        <Image src={`/assets/headshots/${d1?.driver_ref}.png`} fill alt={d1?.surname || ""} className="object-cover" />
                     </motion.div>
                     <div className="space-y-1">
                        <span className="text-[10px] font-black text-f1-red uppercase tracking-[0.4em]">{d1?.nationality}</span>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">{d1?.surname}</h2>
                     </div>
                  </div>

                  {/* Central Radar */}
                  <div className="lg:col-span-6">
                     <PsychometricRadar 
                        d1Stats={{ qualifying_speed: 94, race_pace: 92, consistency: 88, pressure_stability: 85, strategy_retention: 90 }} 
                        d2Stats={{ qualifying_speed: 88, race_pace: 95, consistency: 92, pressure_stability: 96, strategy_retention: 94 }} 
                        d1Name={d1?.surname || "ALPHA"}
                        d2Name={d2?.surname || "BETA"}
                     />
                  </div>

                  {/* Driver B Reveal */}
                  <div className="lg:col-span-3 flex flex-col items-center text-center space-y-6">
                     <motion.div 
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="relative w-64 h-64 rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] bg-black"
                     >
                        <Image src={`/assets/headshots/${d2?.driver_ref}.png`} fill alt={d2?.surname || ""} className="object-cover" />
                     </motion.div>
                     <div className="space-y-1">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">{d2?.nationality}</span>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">{d2?.surname}</h2>
                     </div>
                  </div>
               </div>

               {/* Intelligence Row */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                     <BreakingPointVisualizer 
                        bp1={warfare.breaking_points[d1Id!]} 
                        bp2={warfare.breaking_points[d2Id!]} 
                        d1Name={d1?.surname || "ALPHA"}
                        d2Name={d2?.surname || "BETA"}
                     />
                  </div>
                  
                  <div className="lg:col-span-4">
                     <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl h-full">
                        <div className="mb-8">
                           <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
                              <TrendingUp className="text-f1-gold" />
                              The Explainable Edge
                           </h3>
                           <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Stochastic Narrative Reasoning</p>
                        </div>
                        <div className="space-y-6">
                           {warfare.edge.reasoning.map((reason: string, i: number) => (
                             <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <Zap size={14} className="text-f1-gold shrink-0 mt-1" />
                                <span className="text-xs font-bold text-white/80 leading-relaxed uppercase italic">{reason}</span>
                             </div>
                           ))}
                           <div className="p-6 bg-f1-red/5 border border-f1-red/10 rounded-2xl">
                              <p className="text-[10px] font-black text-f1-red uppercase tracking-widest mb-2 flex items-center gap-2">
                                 <Activity size={12} />
                                 Rivalry Intensity
                              </p>
                              <div className="text-3xl font-black italic text-white">{warfare.rivalry_intensity}%</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-4">
                     <DuelScenarioEngine 
                        onSimulate={async (s) => {
                           const sim = await api.simulateDuel(d1Id!, d2Id!, s);
                           setSimulation({
                              winner: sim.winner_id === d1Id ? d1?.surname : d2?.surname,
                              probability: sim.probability
                           });
                        }} 
                        prediction={simulation}
                     />
                  </div>
               </div>

               {/* Combat Footer */}
               <div className="pt-20 border-t border-white/5 flex flex-col items-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-6">
                     <ShieldHalf size={32} />
                     <div className="h-8 w-px bg-white/20" />
                     <p className="max-w-xl text-center text-[10px] font-medium leading-relaxed italic tracking-widest uppercase">
                       Behavioral profiles are derived from lap-variance analysis, high-pressure sector dominance tracking, and historical rivalry encounter stability.
                     </p>
                  </div>
                  <button className="px-12 py-4 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                     Download Intelligence Combat Card
                  </button>
               </div>
            </motion.div>
          ) : (
             <div className="flex flex-col items-center py-40 border-2 border-dashed border-white/5 rounded-[4rem]">
                <Swords size={48} className="text-white/10 mb-6" />
                <p className="text-xs font-black text-white/20 uppercase tracking-[0.5em]">Select Two Warriors to Begin Simulation</p>
             </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
