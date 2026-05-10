"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TeamData } from "@/data/f1Teams2025";
import { Lock, Zap, Wind, Settings, Activity } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Recharts to keep it out of the main bundle
const HistoryChart = dynamic(() => import("@/components/HistoryChart").then(m => m.HistoryChart), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-white/5 animate-pulse rounded-sm" />
});

interface TeamDetailClientProps {
  team: TeamData;
}

export function TeamDetailClient({ team }: TeamDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"Technical Specs" | "Power Unit" | "Aero" | "ERS">("Technical Specs");

  const renderField = (label: string, value: string, isDisclosed: boolean = true) => (
    <div className="border-b border-white/5 py-4 flex justify-between items-center group transition-ui">
      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        {!isDisclosed ? (
          <span className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">
            <Lock size={8} /> Classified
          </span>
        ) : (
          <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-f1-red)] transition-ui">{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen pt-20 bg-[var(--color-bg-primary)] overflow-hidden">
      
      {/* LEFT PANEL - STATIC VIEW */}
      <div className="w-full lg:w-[60%] h-[50vh] lg:h-full relative border-r border-white/5 z-30 bg-black/20">
        <div className="absolute inset-0 flex items-center justify-center p-12">
           <div className="relative w-full h-full">
             <Image 
                src={`/assets/cars/${team.id}.png`} 
                alt={`${team.name} Car`}
                fill
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                priority
             />
           </div>
        </div>
        
        {/* Team Identity Overlay */}
        <div className="absolute bottom-12 left-12 pointer-events-none">
          <div className="flex items-center gap-6">
            <div className="text-8xl font-black text-white/5 absolute -left-4 -top-8 italic pointer-events-none select-none uppercase font-display">
              {team.shortName}
            </div>
            <div className="relative">
              <h1 className="text-5xl font-black text-[var(--color-text-primary)] uppercase italic tracking-tighter leading-none font-display">
                {team.name}
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-sm border border-white/10">
                  Constructor P2
                </span>
                <span className="text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-[0.3em]">
                  {team.car.engineSupplier} Power
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - INFO */}
      <div className="w-full lg:w-[40%] h-[50vh] lg:h-full flex flex-col bg-[var(--color-bg-secondary)] border-l border-white/5">
        {/* Sticky Tabs */}
        <div className="flex border-b border-white/10 px-8 pt-8">
          {(["Technical Specs", "Power Unit", "Aero", "ERS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 pb-4 text-[10px] font-black uppercase tracking-widest transition-ui ${
                activeTab === tab ? "text-white" : "text-gray-500 hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: team.primaryColor }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-12 custom-scrollbar">
          <div className="space-y-12 transition-reveal opacity-100">
            {activeTab === "Technical Specs" && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Settings size={14} className="text-[var(--color-f1-red)]" />
                  <h3 className="text-white font-black uppercase italic tracking-wider">Chassis & Integration</h3>
                </div>
                <div className="space-y-1">
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
                  <Zap size={14} className="text-[var(--color-f1-red)]" />
                  <h3 className="text-white font-black uppercase italic tracking-wider">Internal Combustion</h3>
                </div>
                <div className="space-y-1">
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
                  <Wind size={14} className="text-[var(--color-f1-red)]" />
                  <h3 className="text-white font-black uppercase italic tracking-wider">Aerodynamics</h3>
                </div>
                <div className="space-y-1">
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
                  <Zap size={14} className="text-[var(--color-f1-red)]" />
                  <h3 className="text-white font-black uppercase italic tracking-wider">Energy Recovery</h3>
                </div>
                <div className="space-y-1">
                  {renderField("Deployment System", team.technology.ersSystem)}
                  {renderField("MGU-K Peak Power", team.technology.mgukPower)}
                  {renderField("Battery Density", "Classified", false)}
                  {renderField("MGU-H Integration", "Turbo-compounding", false)}
                </div>
              </section>
            )}

            {/* PERFORMANCE ANALYSIS */}
            <section className="pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 mb-6">
                 <Activity size={14} className="text-[var(--color-f1-red)]" />
                 <h3 className="text-white font-black uppercase italic tracking-wider">Historical Performance</h3>
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
