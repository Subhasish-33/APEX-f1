"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CarViewer3D } from "@/components/CarViewer3D";
import { HotspotData } from "@/components/CarViewer3D/Hotspots";
import { TeamData } from "@/data/f1Teams2025";
import { Lock, FileText, Zap, Wind, Settings, ArrowLeft, Activity } from "lucide-react";
import { useOrchestration } from "@/context/OrchestrationContext";
import { HistoryChart } from "@/components/HistoryChart";

interface TeamDetailClientProps {
  team: TeamData;
}

export function TeamDetailClient({ team }: TeamDetailClientProps) {
  const { focusId, step, setFocus } = useOrchestration();
  const [activeTab, setActiveTab] = useState<"Technical Specs" | "Power Unit" | "Aero" | "ERS">("Technical Specs");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  const hotspots: HotspotData[] = [
    { id: "front-wing", label: "Front Wing", position: [2.1, 0.1, 0], section: "Aero", partType: "aero" },
    { id: "sidepod", label: "Sidepod Inlets", position: [0.2, 0.4, 0.6], section: "Aero", partType: "aero" },
    { id: "rear-wing", label: "DRS Rear Wing", position: [-1.8, 0.7, 0], section: "Aero", partType: "aero" },
    { id: "engine", label: "Power Unit", position: [-0.5, 0.5, 0], section: "Power Unit", partType: "power" },
  ];

  const handleHotspotClick = (id: string) => {
    const hotspot = hotspots.find(h => h.id === id);
    if (hotspot) {
      setFocus(id);
      setActiveTab(hotspot.section as any);
      viewerRef.current?.focusOn(hotspot.position);
    }
  };

  const handleResetFocus = () => {
    setFocus(null);
    viewerRef.current?.resetCamera();
  };

  const isFocused = !!focusId;

  const renderField = (label: string, value: string, index: number, isDisclosed: boolean = true) => (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ 
        opacity: (step === "REVEAL" || step === "FOCUSED") ? 1 : 0, 
        x: (step === "REVEAL" || step === "FOCUSED") ? 0 : -10 
      }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      className="border-b border-white/5 py-4 flex justify-between items-center group"
    >
      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        {!isDisclosed ? (
          <span className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">
            <Lock size={8} /> Classified
          </span>
        ) : (
          <span className="text-sm font-medium text-white group-hover:text-f1-red transition-colors">{value}</span>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen pt-20 bg-[#0a0a0f] overflow-hidden relative">
      {/* FOCUS OVERLAY */}
      <AnimatePresence>
        {isFocused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-20 pointer-events-none backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* LEFT PANEL - 3D VIEWER */}
      <div className={`w-full lg:w-[60%] h-[50vh] lg:h-full relative border-r border-white/5 z-30 transition-all duration-1000 ${isFocused ? 'lg:w-[70%]' : 'lg:w-[60%]'}`}>
        <CarViewer3D 
          ref={viewerRef}
          modelPath={team.modelPath} 
          teamColor={team.primaryColor} 
          hotspots={hotspots}
          onHotspotClick={handleHotspotClick}
        />
        
        {/* Back Button during Focus */}
        <AnimatePresence>
          {isFocused && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={handleResetFocus}
              className="absolute top-12 left-12 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md z-40 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Team Identity Overlay */}
        <motion.div 
          animate={{ opacity: isFocused ? 0.2 : 1 }}
          className="absolute bottom-12 left-12 pointer-events-none"
        >
          <div className="flex items-center gap-6">
            <div className="text-8xl font-black text-white/5 absolute -left-4 -top-8 italic pointer-events-none select-none">
              {team.shortName}
            </div>
            <div className="relative">
              <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                {team.name}
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-sm border border-white/10">
                  Constructor P2
                </span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                  {team.car.engineSupplier} Power
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL - INFO */}
      <div className={`w-full lg:w-[40%] h-[50vh] lg:h-full flex flex-col bg-black/20 backdrop-blur-3xl z-40 transition-all duration-1000 ${isFocused ? 'lg:w-[30%]' : 'lg:w-[40%]'}`}>
        {/* Sticky Tabs */}
        <div className="flex border-b border-white/10 px-8 pt-8">
          {(["Technical Specs", "Power Unit", "Aero", "ERS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 pb-4 text-[10px] font-black uppercase tracking-widest transition-colors ${
                activeTab === tab ? "text-white" : "text-gray-500 hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: team.primaryColor }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-12 custom-scrollbar" ref={scrollContainerRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${focusId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: (isFocused && step === "IDLE") ? 0.3 : 1, 
                y: 0 
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              {activeTab === "Technical Specs" && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Settings size={14} className="text-f1-red" />
                    <h3 className="text-white font-black uppercase italic tracking-wider">Chassis & Integration</h3>
                  </div>
                  <div className="space-y-2">
                    {renderField("Monocoque", team.car.chassis, 0)}
                    {renderField("Transmission", team.car.gearbox, 1)}
                    {renderField("Suspension", team.car.suspension, 2)}
                    {renderField("Braking System", team.car.brakes, 3)}
                    {renderField("Minimum Weight", team.car.weight, 4)}
                    {renderField("Wheelbase", team.car.wheelbase, 5)}
                  </div>
                </section>
              )}

              {activeTab === "Power Unit" && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Zap size={14} className="text-f1-red" />
                    <h3 className="text-white font-black uppercase italic tracking-wider">Internal Combustion</h3>
                  </div>
                  <div className="space-y-2">
                    {renderField("Engine Model", team.car.engine, 0)}
                    {renderField("Supplier", team.car.engineSupplier, 1)}
                    {renderField("Fuel System", team.technology.fuelSystem, 2)}
                    {renderField("Cooling Logic", team.technology.coolingSystem, 3)}
                    {renderField("Cylinder Config", "90° V6", 4, false)}
                    {renderField("RPM Limit", "15,000", 5, false)}
                  </div>
                </section>
              )}

              {activeTab === "Aero" && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Wind size={14} className="text-f1-red" />
                    <h3 className="text-white font-black uppercase italic tracking-wider">Aerodynamics</h3>
                  </div>
                  <div className="space-y-2">
                    {renderField("DRS Actuator", team.technology.drsSystem, 0)}
                    {renderField("Front Wing Config", "Multi-element flap", 1, false)}
                    {renderField("Sidepod Concept", "High-inlet downwash", 2, false)}
                    {renderField("Floor Venturi", "Classified Geometry", 3, false)}
                  </div>
                </section>
              )}

              {activeTab === "ERS" && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Zap size={14} className="text-f1-red" />
                    <h3 className="text-white font-black uppercase italic tracking-wider">Energy Recovery</h3>
                  </div>
                  <div className="space-y-2">
                    {renderField("Deployment System", team.technology.ersSystem, 0)}
                    {renderField("MGU-K Peak Power", team.technology.mgukPower, 1)}
                    {renderField("Battery Density", "Classified", 2, false)}
                    {renderField("MGU-H Integration", "Turbo-compounding", 3, false)}
                  </div>
                </section>
              )}

              {/* HISTORICAL PERFORMANCE LAYER */}
              <section className="pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 mb-6">
                   <Activity size={14} className="text-f1-red" />
                   <h3 className="text-white font-black uppercase italic tracking-wider">Historical Achievement</h3>
                </div>
                
                <HistoryChart 
                  teamColor={team.primaryColor}
                  data={[
                    { year: 2020, points: 131, position: 6, wins: 0 },
                    { year: 2021, points: 323.5, position: 3, wins: 0 },
                    { year: 2022, points: 554, position: 2, wins: 4 },
                    { year: 2023, points: 406, position: 3, wins: 1 },
                    { year: 2024, points: 652, position: 2, wins: 5 },
                  ]}
                />

                {/* Rivalry Analysis */}
                <div className="mt-6 bg-white/5 rounded-sm p-4 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                       <Zap size={16} className="text-white/40" />
                    </div>
                    <div>
                      <span className="text-[8px] text-white/40 font-black uppercase tracking-widest block mb-1">Primary Rival</span>
                      <span className="text-xs font-black text-white uppercase italic">Oracle Red Bull Racing</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-white/40 font-black uppercase tracking-widest block mb-1">Gap to Leader</span>
                    <span className="text-xs font-black text-f1-red uppercase">-37.5 PTS</span>
                  </div>
                </div>
              </section>

              {/* PREDICTIVE INTELLIGENCE LAYER */}
              <section className="pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                   <h3 className="text-cyan-400 font-black uppercase italic tracking-wider">AI Predictive Analysis</h3>
                </div>
                
                <div className="bg-white/5 rounded-sm p-6 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">2026 Podium Probability</span>
                      <span className="text-4xl font-black text-white italic">78.4<span className="text-lg opacity-40">%</span></span>
                    </div>
                    <div className="text-right">
                       <span className="block text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Confidence</span>
                       <span className="text-xs font-black text-cyan-400 uppercase">High (±2.1%)</span>
                    </div>
                  </div>

                  {/* Factor Contribution */}
                  <div className="space-y-3">
                    <span className="block text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">Explainable Intelligence: Factor Contribution</span>
                    {[
                      { factor: "Aero Efficiency", impact: "+12.4%", color: "bg-green-500", relatedParts: ["front-wing", "sidepod", "rear-wing"] },
                      { factor: "MGU-K Recovery", impact: "+5.2%", color: "bg-green-500", relatedParts: ["engine"] },
                      { factor: "Minimum Weight", impact: "-2.1%", color: "bg-red-500", relatedParts: [] },
                    ].map((f, i) => {
                      const isRelated = f.relatedParts.includes(focusId || "");
                      return (
                        <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${isRelated ? 'opacity-100 scale-105' : 'opacity-40'}`}>
                          <span className={`text-[10px] font-bold w-24 uppercase tracking-tighter ${isRelated ? 'text-white' : 'text-white/60'}`}>{f.factor}</span>
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "70%" }}
                              transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                              className={`h-full ${f.color}`}
                            />
                          </div>
                          <span className={`text-[10px] font-black ${f.impact.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {f.impact}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-white/40 leading-relaxed italic">
                    "The neural engine projects a significant performance uplift for the 2026 {team.shortName} chassis, primarily driven by the aggressive downwash sidepod concept and optimized ERS deployment logic."
                  </p>
                </div>
              </section>

              {/* Verified Badge */}
              <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-green-500/80">Verified Data Layer</span>
                </div>
                <button className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                  <FileText size={10} /> View Technical Regs
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-white/10 bg-black/40">
           <button className="w-full py-4 bg-white text-black font-black uppercase italic text-xs tracking-widest hover:bg-f1-red hover:text-white transition-all transform active:scale-95">
             Compare with another team
           </button>
        </div>
      </div>
    </div>
  );
}
