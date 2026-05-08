"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, AlertTriangle, Zap, CloudRain, ShieldOff, Moon, Settings2 } from "lucide-react";

interface DuelScenarioEngineProps {
  onSimulate: (scenario: string) => void;
  prediction: any;
}

export function DuelScenarioEngine({ onSimulate, prediction }: DuelScenarioEngineProps) {
  const [scenario, setScenario] = useState("dry");

  const handleScenarioChange = (id: string) => {
    setScenario(id);
    onSimulate(id);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-3xl relative overflow-hidden">
      <div className="mb-8">
        <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
          <Settings2 className="text-f1-gold" />
          Duel Scenario Engine
        </h3>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Stochastic Outcome Modeler</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScenarioCard 
          id="dry" 
          label="Dry Standard" 
          icon={<Zap size={16} />}
          active={scenario === "dry"}
          onClick={() => handleScenarioChange("dry")}
        />
        <ScenarioCard 
          id="wet" 
          label="Extreme Rain" 
          icon={<CloudRain size={16} />}
          active={scenario === "wet"}
          onClick={() => handleScenarioChange("wet")}
        />
        <ScenarioCard 
          id="night" 
          label="Night Duel" 
          icon={<Moon size={16} />}
          active={scenario === "night"}
          onClick={() => handleScenarioChange("night")}
        />
        <ScenarioCard 
          id="chaos" 
          label="High Chaos" 
          icon={<ShieldOff size={16} />}
          active={scenario === "chaos"}
          onClick={() => handleScenarioChange("chaos")}
        />
      </div>

      {/* Projection HUD */}
      <div className="mt-8 p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap size={60} />
         </div>
         
         <div className="flex flex-col items-center text-center">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">PROJECTED COMBAT WINNER</span>
            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-1">
               {prediction?.winner || "CALCULATING..."}
            </h4>
            <div className="flex items-center gap-2 mb-6">
               <span className="text-3xl font-black text-f1-red italic">{prediction?.probability || 0}%</span>
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Confidence</span>
            </div>

            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 key={prediction?.probability}
                 initial={{ width: 0 }}
                 animate={{ width: `${prediction?.probability || 0}%` }}
                 className="h-full bg-gradient-to-r from-f1-red to-f1-gold"
               />
            </div>
         </div>
      </div>
    </div>
  );
}

function ScenarioCard({ id, label, icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
        active ? "bg-f1-gold/20 border-f1-gold text-f1-gold" : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
      }`}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
