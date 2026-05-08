"use client";

import { useState, useEffect, use } from "react";
import { api } from "../../../lib/api";
import { RaceDetail, Telemetry, Driver } from "@apex/types";
import { PodiumDisplay } from "../../../components/Race/PodiumDisplay";
import { ResultsTable } from "../../../components/Race/ResultsTable";
import { RaceReplayHUD } from "../../../components/Race/RaceReplayHUD";
import ReplayOrchestrator from "../../../components/LiveTiming/ReplayOrchestrator";
import { RaceMomentFeed } from "../../../components/Race/RaceMomentFeed";
import { StrategyIntelligence } from "../../../components/Race/StrategyIntelligence";
import { RacePACEAnalytics } from "../../../components/Race/RacePACEAnalytics";
import { StorylineCard } from "../../../components/Race/StorylineCard";
import { FastestLapCinematic } from "../../../components/Race/FastestLapCinematic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/UI/Tabs";
import { ChevronLeft, Zap, Activity, Info, Eye, Layers } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RaceIntelligencePage({ params }: PageProps) {
  const { id } = use(params);
  const raceId = parseInt(id);

  const [race, setRace] = useState<RaceDetail | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [currentLap, setCurrentLap] = useState(1);
  const [showFastestLap, setShowFastestLap] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const enableLiveReplay = process.env.NEXT_PUBLIC_ENABLE_LIVE_REPLAY === "true";

  useEffect(() => {
    async function loadData() {
      try {
        const [raceData, telemetryData] = await Promise.all([
          api.getRace(raceId),
          api.getRaceTelemetry(raceId)
        ]);
        setRace(raceData);
        setTelemetry(telemetryData);
        // Set initial lap to total laps for the "Archive" view, 
        // or lap 1 for "Replay" start.
        setCurrentLap(raceData.laps || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [raceId]);

  if (loading || !race) {
    return <div className="min-h-screen bg-f1-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-12 h-12 text-f1-red animate-spin" />
        <span className="text-[10px] font-black tracking-[0.5em] text-white/40">SYNCHRONIZING REPLAY ENGINE...</span>
      </div>
    </div>;
  }

  const atmosphere = getAtmosphereMode(race.circuit?.name || "");

  return (
    <main className={`min-h-screen ${atmosphere.bg} text-white pt-24 pb-40 overflow-x-hidden transition-colors duration-1000`}>
      {/* Cinematic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 ${atmosphere.overlay} opacity-20`} />
        <div className={`absolute top-[20%] right-[10%] w-[800px] h-[800px] ${atmosphere.glow} blur-[200px] rounded-full animate-pulse`} />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 relative z-10">
        {/* Navigation & Status */}
        <div className="flex items-center justify-between mb-12">
          <Link 
            href="/calendar"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase">Temporal Exit</span>
          </Link>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-white/40">INTELLIGENCE_STREAM: STABLE</span>
             </div>
             {enableLiveReplay && (
               <button 
                 onClick={() => setShowReplay(!showReplay)}
                 className={`flex items-center gap-2 px-4 py-1.5 border rounded-full transition-all group ${showReplay ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-f1-red/20 border-f1-red/30 hover:bg-f1-red/40'}`}
               >
                 <Activity size={14} className={`${showReplay ? 'text-cyan-400' : 'text-f1-red'} group-hover:scale-110 transition-transform`} />
                 <span className={`text-[10px] font-black tracking-widest uppercase ${showReplay ? 'text-cyan-400' : 'text-f1-red'}`}>
                   {showReplay ? 'Exit Replay' : 'Live Replay'} <span className="bg-white/20 px-1 rounded ml-1 text-[8px]">BETA</span>
                 </span>
               </button>
             )}
             <button 
               onClick={() => setShowFastestLap(true)}
               className="flex items-center gap-2 px-4 py-1.5 bg-purple-600/20 border border-purple-500/30 rounded-full hover:bg-purple-600/40 transition-all group"
             >
                <Zap size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase">Fastest Lap Replay</span>
             </button>
          </div>
        </div>

        {/* Cinematic Header */}
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-f1-red">
                <Layers size={24} />
                <span className="text-lg font-black tracking-[0.4em] uppercase italic">Race Intelligence OS v10.4</span>
              </div>
              <h1 className={`text-7xl md:text-[10rem] font-black tracking-tighter leading-none italic uppercase ${atmosphere.text}`}>
                {race.name.replace("Grand Prix", "")} <span className="text-white/10">GP</span>
              </h1>
              <div className="flex flex-wrap items-center gap-10 text-white/30 font-black text-xl tracking-tight">
                <span className="flex items-center gap-3"><Eye className="text-f1-red" /> REPLAY_MODE_ACTIVE</span>
                <span>CIRCUIT: {race.circuit?.name.toUpperCase()}</span>
                <span>ROUND {race.round} // {race.year}</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
               <MetricHUD label="TOTAL_LAPS" value={race.laps?.toString() || "—"} />
               <MetricHUD label="EVENTS_IDENTIFIED" value={race.moments.length.toString()} />
               <MetricHUD label="AVG_SPEED" value="238.4 KM/H" />
               <MetricHUD label="CHAOS_INDEX" value="HIGH" color="text-orange-500" />
            </div>
          </motion.div>
        </header>

        {/* Cinematic Live Replay Overlay */}
        <AnimatePresence>
          {showReplay && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
               <ReplayOrchestrator raceId={raceId} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mission Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Main Visualizer (7 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            <PositionTrace telemetry={telemetry} drivers={race.results.map(r => r.driver!)} currentLap={currentLap} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <StrategyIntelligence pitStops={race.pit_stops} results={race.results} totalLaps={race.laps || 70} />
               <RacePACEAnalytics telemetry={telemetry} driverId={race.results[0]?.driver_id || 0} totalLaps={race.laps || 70} />
            </div>

            {/* Podium Moment (Visual breathing room) */}
            <div className="py-20">
               <PodiumDisplay results={race.results} />
            </div>
          </div>

          {/* Intelligence Feed (4 Columns) */}
          <div className="lg:col-span-4 space-y-8">
             <RaceMomentFeed moments={race.moments} currentLap={currentLap} />
             
             {/* Storylines Section */}
             <div className="space-y-6 pt-10 border-t border-white/5">
                <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] mb-8">Contextual Storylines</h3>
                <StorylineCard 
                  title="Tire Whisperer" 
                  driver="LEWIS HAMILTON" 
                  description="Extremely consistent pace on a 32-lap old Hard stint. Identified as the key strategic pivot for the podium finish."
                  type="technical"
                  metadata="TIRE_LIFE: 84%"
                />
                <StorylineCard 
                  title="Late Race Collapse" 
                  driver="CHARLES LECLERC" 
                  description="Sudden 1.4s pace drop in the final 5 laps due to hybrid deployment thermal clipping. Lost P3 in final sector."
                  type="negative"
                  metadata="PACE_DELTA: -1.4s"
                />
                <StorylineCard 
                  title="Undercut Master" 
                  driver="MAX VERSTAPPEN" 
                  description="Flawless out-lap execution on Lap 14 gained 4.2 seconds over the race leader, securing a definitive advantage."
                  type="hero"
                  metadata="OUT_LAP_PACE: +0.8s"
                />
             </div>
          </div>
        </div>

        {/* Detailed Data Accordion */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-f1-red/40 to-transparent" />
          
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="mb-12 bg-black/40 border border-white/10 p-1 rounded-full h-14">
              <TabsTrigger value="results" className="rounded-full px-12 text-[10px] font-black uppercase tracking-widest transition-all">Results Matrix</TabsTrigger>
              <TabsTrigger value="qualifying" className="rounded-full px-12 text-[10px] font-black uppercase tracking-widest transition-all">Qualifying Delta</TabsTrigger>
              <TabsTrigger value="incidents" className="rounded-full px-12 text-[10px] font-black uppercase tracking-widest transition-all">Incident Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <ResultsTable results={race.results} />
            </TabsContent>
            
            <TabsContent value="qualifying">
              <QualifyingTable qualifying={race.qualifying} />
            </TabsContent>
            
            <TabsContent value="incidents">
              <div className="py-20 text-center space-y-6">
                 <AlertTriangle size={48} className="mx-auto text-orange-500 opacity-20" />
                 <h3 className="text-xl font-black italic">NO MAJOR INCIDENTS REPORTED</h3>
                 <p className="text-white/30 text-sm max-w-sm mx-auto font-medium leading-relaxed">
                   Race concluded without Safety Car intervention. VSC was active for 2 laps (Lap 41-42) due to debris in Sector 2.
                 </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Replay Controller (Fixed) */}
        <RaceReplayHUD 
          totalLaps={race.laps || 70} 
          currentLap={currentLap} 
          onLapChange={setCurrentLap} 
        />

        {/* Fastest Lap Cinematic Overlay */}
        <FastestLapCinematic 
          show={showFastestLap} 
          driver={race.results[0]?.driver?.surname || ""} 
          time={race.results[0]?.fastest_lap_time || "1:21.046"} 
          onComplete={() => setShowFastestLap(false)} 
        />
      </div>
    </main>
  );
}

function MetricHUD({ label, value, color = "text-white" }: any) {
  return (
    <div className="bg-black/60 border border-white/10 p-5 rounded-2xl flex flex-col min-w-[140px] backdrop-blur-xl">
       <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{label}</span>
       <span className={`text-xl font-black italic ${color}`}>{value}</span>
    </div>
  );
}

function getAtmosphereMode(circuitName: string) {
  if (circuitName.includes("Monaco")) {
    return { 
      bg: "bg-[#0a0a0f]", 
      overlay: "bg-blue-900", 
      glow: "bg-blue-600", 
      text: "text-blue-500" 
    };
  }
  if (circuitName.includes("Singapore") || circuitName.includes("Las Vegas")) {
    return { 
      bg: "bg-black", 
      overlay: "bg-purple-900", 
      glow: "bg-purple-600", 
      text: "text-f1-red shadow-[0_0_20px_rgba(225,6,0,0.5)]" 
    };
  }
  if (circuitName.includes("Monza") || circuitName.includes("Spa")) {
    return { 
      bg: "bg-[#0f0a0a]", 
      overlay: "bg-f1-red", 
      glow: "bg-f1-red", 
      text: "text-f1-red" 
    };
  }
  return { 
    bg: "bg-[#0a0a0f]", 
    overlay: "bg-f1-red", 
    glow: "bg-f1-red", 
    text: "text-f1-red" 
  };
}
