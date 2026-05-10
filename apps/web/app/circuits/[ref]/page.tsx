import { use } from "react";
import { api } from "../../../lib/api";
import { CircuitHUD } from "../../../components/Circuit/CircuitHUD";
import { ChevronLeft, Trophy, Zap, Wind } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ ref: string }>;
}

export default function CircuitDetailPage({ params }: PageProps) {
  const { ref } = use(params);
  
  const circuitPromise = api.getCircuit(ref);
  const circuit = use(circuitPromise);

  const richStats = {
    length: "5.793 KM",
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
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Navigation */}
        <div className="mb-10">
          <Link 
            href="/calendar"
            className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-ui group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-ui" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Back to Calendar</span>
          </Link>
        </div>

        {/* Header */}
        <header className="mb-16 border-b border-white/5 pb-10">
          <div className="flex items-center gap-4 text-[var(--color-f1-red)] mb-4">
            <Zap size={20} />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase italic">Circuit Profile</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter italic uppercase leading-none">
            {circuit.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-[var(--color-text-secondary)] font-bold text-lg mt-4">
            <span>{circuit.location}</span>
            <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
            <span>{circuit.country}</span>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left: Circuit HUD */}
          <div className="lg:col-span-2">
            <CircuitHUD name={circuit.name} stats={richStats} />
          </div>

          {/* Right: Technical Profile */}
          <div className="space-y-8">
            <div className="bg-[var(--color-bg-secondary)] border border-white/5 rounded-sm p-8">
              <h3 className="text-xl font-black mb-8 flex items-center gap-2 italic uppercase font-display">
                <Trophy size={18} className="text-[var(--color-f1-gold)]" />
                Technical Profile
              </h3>
              <div className="space-y-8">
                <TechnicalMetric 
                  label="Overtaking Difficulty" 
                  value={circuit.overtaking_difficulty ? `${circuit.overtaking_difficulty}/10` : "4.0/10"} 
                  bar={circuit.overtaking_difficulty ? circuit.overtaking_difficulty / 10 : 0.4} 
                />
                <TechnicalMetric 
                  label="Downforce Level" 
                  value={circuit.downforce_level || "LOW"} 
                  description="High-speed efficiency focus." 
                />
                <TechnicalMetric 
                  label="Tire Degradation" 
                  value={circuit.tire_degradation || "MEDIUM"} 
                  description="Thermal management priority." 
                />
              </div>
            </div>

            <div className="bg-[var(--color-f1-red)]/5 border border-[var(--color-f1-red)]/10 rounded-sm p-8">
              <h3 className="text-[10px] font-black mb-6 flex items-center gap-2 text-[var(--color-f1-red)] uppercase tracking-widest italic">
                <Wind size={16} />
                Environment Status
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase mb-2">Track Surface</span>
                  <span className="text-2xl font-black tracking-tight font-data italic">42.8°C</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase mb-2">Humidity</span>
                  <span className="text-2xl font-black tracking-tight font-data italic">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <section className="bg-[var(--color-bg-secondary)] border border-white/5 rounded-sm p-8 md:p-12">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-black tracking-tight italic uppercase mb-2">Recent Winners</h2>
            <p className="text-[var(--color-text-muted)] font-bold uppercase tracking-widest text-[10px]">Grand Prix Results 2020—2024</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {winners.map((winner) => (
              <div key={winner.year} className="p-6 bg-white/5 border border-white/10 rounded-sm group hover:border-[var(--color-f1-red)]/50 transition-ui">
                <div className="text-[10px] font-black text-[var(--color-text-muted)] mb-3 font-data">{winner.year}</div>
                <div className="text-lg font-black leading-tight mb-2 group-hover:text-[var(--color-f1-red)] transition-ui italic uppercase font-display">{winner.driver}</div>
                <div className="text-[8px] font-black text-[var(--color-f1-gold)] uppercase tracking-widest">{winner.constructor}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function TechnicalMetric({ label, value, bar, description, color = "bg-[var(--color-f1-red)]" }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-[var(--color-text-muted)] tracking-widest uppercase">{label}</span>
        <span className="text-sm font-black italic">{value}</span>
      </div>
      {bar !== undefined && (
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color}`} 
            style={{ width: `${bar * 100}%` }}
          />
        </div>
      )}
      {description && <p className="text-[8px] text-[var(--color-text-muted)] italic font-medium">{description}</p>}
    </div>
  );
}
