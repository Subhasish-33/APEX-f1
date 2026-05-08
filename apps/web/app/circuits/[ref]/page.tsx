import { use } from "react";
import { api } from "../../../lib/api";
import { CircuitHUD } from "../../../components/Circuit/CircuitHUD";
import { motion } from "framer-motion";
import { ChevronLeft, Trophy, Clock, Zap, AlertTriangle, Wind, Droplets } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ ref: string }>;
}

export default function CircuitDetailPage({ params }: PageProps) {
  const { ref } = use(params);
  
  // In a real app, these would be fetched from the API
  // For now, we enhance the API data with curated stats if missing
  const circuitPromise = api.getCircuit(ref);
  const circuit = use(circuitPromise);

  // Mocked rich data for the Day 9 orchestration
  const richStats = {
    length: "5.793 km",
    turns: 11,
    drsZones: 2,
    lapRecord: {
      time: "1:21.046",
      driver: "Rubens Barrichello",
      year: 2004
    }
  };

  const winners = [
    { year: 2024, driver: "Lewis Hamilton", constructor: "Mercedes" },
    { year: 2023, driver: "Max Verstappen", constructor: "Red Bull" },
    { year: 2022, driver: "Max Verstappen", constructor: "Red Bull" },
    { year: 2021, driver: "Daniel Ricciardo", constructor: "McLaren" },
    { year: 2020, driver: "Pierre Gasly", constructor: "AlphaTauri" },
  ];

  return (
    <main className="min-h-screen bg-f1-dark text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Navigation */}
        <Link 
          href="/calendar"
          className="inline-flex items-center gap-2 text-white/40 hover:text-f1-red transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black tracking-widest">BACK TO TIMELINE</span>
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-f1-red mb-4">
            <Zap size={20} />
            <span className="text-sm font-black tracking-[0.3em] uppercase">Circuit Intelligence Hub</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
            {circuit.name.toUpperCase()}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/40 font-bold text-lg">
            <span>{circuit.location}</span>
            <div className="w-2 h-2 bg-white/10 rounded-full" />
            <span>{circuit.country}</span>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Circuit HUD */}
          <div className="lg:col-span-2">
            <CircuitHUD name={circuit.name} stats={{ ...richStats, stats: { length: richStats.length, turns: richStats.turns, drsZones: richStats.drsZones, lapRecord: richStats.lapRecord } }} />
          </div>

          {/* Right: Technical Profile */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Trophy size={20} className="text-f1-gold" />
                TECHNICAL PROFILE
              </h3>
              <div className="space-y-6">
                <TechnicalMetric label="Overtaking Index" value={circuit.overtaking_difficulty ? `${circuit.overtaking_difficulty}/10` : "4.0/10"} bar={circuit.overtaking_difficulty ? circuit.overtaking_difficulty / 10 : 0.4} />
                <TechnicalMetric label="Downforce Level" value={circuit.downforce_level || "LOW"} description="Favors high-speed efficiency over cornering grip." />
                <TechnicalMetric label="Tire Degradation" value={circuit.tire_degradation || "MEDIUM"} description="Thermal management is key for multi-stop strategies." />
                <TechnicalMetric label="Chaos Probability" value="65%" bar={0.65} color="bg-orange-500" />
              </div>
            </div>

            <div className="bg-f1-red/10 border border-f1-red/30 rounded-3xl p-8">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-f1-red">
                <Wind size={20} />
                LIVE ATMOSPHERE
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-f1-red/60 uppercase mb-1">Track Temp</span>
                  <span className="text-2xl font-black tracking-tight">42.8°C</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-f1-red/60 uppercase mb-1">Rain Prob.</span>
                  <span className="text-2xl font-black tracking-tight text-teal-400">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">RACE HISTORY</h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Last 10 Winners & Iconic Moments</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {winners.map((winner, idx) => (
              <div key={winner.year} className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-f1-red/50 transition-all">
                <div className="text-[10px] font-black text-white/30 mb-2">{winner.year}</div>
                <div className="text-lg font-black leading-tight mb-1 group-hover:text-f1-red">{winner.driver}</div>
                <div className="text-xs font-bold text-f1-gold/60">{winner.constructor.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function TechnicalMetric({ label, value, bar, description, color = "bg-f1-red" }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-white/40 tracking-wider uppercase">{label}</span>
        <span className="text-sm font-black">{value}</span>
      </div>
      {bar !== undefined && (
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full`} 
            style={{ width: `${bar * 100}%` }}
          />
        </div>
      )}
      {description && <p className="text-[10px] text-white/30 italic">{description}</p>}
    </div>
  );
}
