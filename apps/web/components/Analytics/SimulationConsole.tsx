"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, AlertTriangle, Zap, CloudRain, ShieldOff } from "lucide-react";

interface SimulationConsoleProps {
  onSimulate: (scenario: any) => void;
}

export function SimulationConsole({ onSimulate }: SimulationConsoleProps) {
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);

  const toggleScenario = (id: string) => {
    const next = activeScenarios.includes(id) 
      ? activeScenarios.filter(s => s !== id) 
      : [...activeScenarios, id];
    setActiveScenarios(next);
    onSimulate(next);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
         <RotateCcw size={100} className="text-white" />
      </div>

      <div className="mb-8 relative z-10">
        <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
          <Zap className="text-f1-gold" />
          Simulation Console
        </h3>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Stochastic Outcome Modeler</p>
      </div>

      <div className="space-y-4 relative z-10">
        <ScenarioToggle 
          id="leader_dnf" 
          label="Title Leader DNF" 
          description="Simulate P1 mechanical failure in next round"
          icon={<ShieldOff size={16} />}
          active={activeScenarios.includes("leader_dnf")}
          onClick={() => toggleScenario("leader_dnf")}
          color="border-f1-red"
        />
        <ScenarioToggle 
          id="rain_chaos" 
          label="Extreme Weather Shift" 
          description="Inject 80% chaos probability into remaining races"
          icon={<CloudRain size={16} />}
          active={activeScenarios.includes("rain_chaos")}
          onClick={() => toggleScenario("rain_chaos")}
          color="border-blue-400"
        />
        <ScenarioToggle 
          id="midfield_revolution" 
          label="Midfield Performance Surge" 
          description="Boost Tier 2 teams performance by 15%"
          icon={<TrendingUp size={16} />}
          active={activeScenarios.includes("midfield_revolution")}
          onClick={() => toggleScenario("midfield_revolution")}
          color="border-green-500"
        />
      </div>

      <button 
        onClick={() => { setActiveScenarios([]); onSimulate([]); }}
        className="mt-8 w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
      >
        <RotateCcw size={16} className="text-white/40 group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Reset Reality Engine</span>
      </button>

      <div className="mt-8 p-4 bg-f1-gold/10 border border-f1-gold/20 rounded-xl flex items-start gap-4">
         <AlertTriangle size={16} className="text-f1-gold shrink-0 mt-0.5" />
         <p className="text-[9px] text-f1-gold font-bold leading-relaxed uppercase italic">
           Warning: Simulated outcomes use non-linear regression models. Probabilities are strictly advisory.
         </p>
      </div>
    </div>
  );
}

function ScenarioToggle({ id, label, description, icon, active, onClick, color }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
        active ? `${color} bg-white/5` : "border-white/5 bg-transparent hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
           <div className={`${active ? 'text-white' : 'text-white/20'} transition-colors`}>{icon}</div>
           <span className={`text-xs font-black uppercase italic ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
        </div>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-f1-gold' : 'bg-white/10'}`}>
           <motion.div 
             animate={{ x: active ? 18 : 2 }}
             className="absolute top-1 w-2 h-2 bg-white rounded-full"
           />
        </div>
      </div>
      <p className="text-[10px] font-medium text-white/20 leading-tight">{description}</p>
    </div>
  );
}

import { TrendingUp } from "lucide-react";
