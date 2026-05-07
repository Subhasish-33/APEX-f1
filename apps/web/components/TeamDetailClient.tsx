"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CarViewer3D } from "@/components/CarViewer3D";
import { HotspotData } from "@/components/CarViewer3D/Hotspots";
import { TeamData } from "@/data/f1Teams2025";
import { Lock, FileText, Zap, Wind, Settings } from "lucide-react";

interface TeamDetailClientProps {
  team: TeamData;
}

export function TeamDetailClient({ team }: TeamDetailClientProps) {
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
      setActiveTab(hotspot.section as any);
      viewerRef.current?.focusOn(hotspot.position);
    }
  };

  const renderField = (label: string, value: string, isDisclosed: boolean = true) => (
    <div className="border-b border-white/5 py-4 flex justify-between items-center group">
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
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0a0a0f] overflow-hidden">
      {/* LEFT PANEL - 3D VIEWER */}
      <div className="w-full lg:w-[60%] h-[50vh] lg:h-full relative border-r border-white/5">
        <CarViewer3D 
          ref={viewerRef}
          modelPath={team.modelPath} 
          teamColor={team.primaryColor} 
          hotspots={hotspots}
          onHotspotClick={handleHotspotClick}
        />
        
        {/* Team Identity Overlay */}
        <div className="absolute bottom-12 left-12 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
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
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - INFO */}
      <div className="w-full lg:w-[40%] h-[50vh] lg:h-full flex flex-col bg-black/20 backdrop-blur-3xl">
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
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {activeTab === "Technical Specs" && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Settings size={14} className="text-f1-red" />
                    <h3 className="text-white font-black uppercase italic tracking-wider">Chassis & Integration</h3>
                  </div>
                  <div className="space-y-2">
                    {renderField("Monocoque", team.car.chassis)}
                    {renderField("Transmission", team.car.gearbox)}
                    {renderField("Suspension", team.car.suspension)}
                    {renderField("Braking System", team.car.brakes)}
                    {renderField("Minimum Weight", team.car.weight)}
                    {renderField("Wheelbase", team.car.wheelbase)}
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
                    {renderField("Engine Model", team.car.engine)}
                    {renderField("Supplier", team.car.engineSupplier)}
                    {renderField("Fuel System", team.technology.fuelSystem)}
                    {renderField("Cooling Logic", team.technology.coolingSystem)}
                    {renderField("Cylinder Config", "90° V6", false)}
                    {renderField("RPM Limit", "15,000", false)}
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
                    {renderField("DRS Actuator", team.technology.drsSystem)}
                    {renderField("Front Wing Config", "Multi-element flap", false)}
                    {renderField("Sidepod Concept", "High-inlet downwash", false)}
                    {renderField("Floor Venturi", "Classified Geometry", false)}
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
                    {renderField("Deployment System", team.technology.ersSystem)}
                    {renderField("MGU-K Peak Power", team.technology.mgukPower)}
                    {renderField("Battery Density", "Classified", false)}
                    {renderField("MGU-H Integration", "Turbo-compounding", false)}
                  </div>
                </section>
              )}

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
