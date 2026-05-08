import React from 'react';
import { f1Teams2025 } from '@/data/f1Teams2025';
import { Clock, Activity, Target } from 'lucide-react';

interface DriverPosition {
  driver_ref: string;
  code: string;
  position: number;
  time: string;
}

interface MissionControlHUDProps {
  currentLap: number;
  totalLaps: number;
  positions: DriverPosition[];
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function MissionControlHUD({ 
  currentLap, 
  totalLaps, 
  positions,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onSpeedChange
}: MissionControlHUDProps) {

  const getTeamColor = (code: string) => {
    if (["VER", "PER"].includes(code)) return f1Teams2025.redbull.primaryColor;
    if (["NOR", "PIA"].includes(code)) return f1Teams2025.mclaren.primaryColor;
    if (["LEC", "SAI"].includes(code)) return f1Teams2025.ferrari.primaryColor;
    if (["HAM", "RUS"].includes(code)) return f1Teams2025.mercedes.primaryColor;
    if (["ALO", "STR"].includes(code)) return f1Teams2025.astonmartin.primaryColor;
    return "#ffffff";
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex justify-between">
      
      {/* Left: Timing Tower */}
      <div className="w-64 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden flex flex-col pointer-events-auto h-full shadow-2xl">
        <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
           <div className="font-black text-white italic tracking-widest uppercase text-sm">Live Timing</div>
           <div className="text-f1-red font-mono text-xs flex items-center gap-1 animate-pulse">
             <Activity size={12} /> Live
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto hidden-scrollbar p-2 space-y-1">
          {positions.map((p) => (
            <div key={p.code} className="flex items-center text-xs bg-white/5 rounded border border-transparent hover:border-white/20 transition-colors">
               <div className="w-6 text-center font-mono text-gray-500 py-2 border-r border-white/10">{p.position}</div>
               <div className="w-1 h-full" style={{ backgroundColor: getTeamColor(p.code) }} />
               <div className="flex-1 px-3 font-bold text-white tracking-wider">{p.code}</div>
               <div className="pr-3 font-mono text-gray-400 text-[10px]">{p.position === 1 ? 'Leader' : `+${(Math.random() * 2).toFixed(1)}s`}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Strategy & Controls */}
      <div className="w-72 flex flex-col gap-4 pointer-events-auto">
        
        {/* Race Status Panel */}
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-2xl">
           <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Lap</div>
                <div className="text-3xl font-black text-white italic leading-none">{currentLap} <span className="text-sm text-gray-500">/ {totalLaps}</span></div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end"><Target size={10}/> Status</div>
                <div className="text-sm font-black text-white tracking-widest uppercase text-green-400">Track Clear</div>
              </div>
           </div>

           {/* Controls */}
           <div className="flex items-center justify-between mt-4">
              <button 
                onClick={onPlayPause}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-xs rounded transition-colors"
              >
                {isPlaying ? 'PAUSE' : 'PLAY REPLAY'}
              </button>

              <div className="flex bg-white/5 rounded border border-white/10 overflow-hidden">
                {[1, 5, 20].map(speed => (
                  <button 
                    key={speed}
                    onClick={() => onSpeedChange(speed)}
                    className={`px-3 py-1.5 text-[10px] font-mono font-bold transition-colors ${playbackSpeed === speed ? 'bg-f1-red text-white' : 'text-gray-500 hover:bg-white/10'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Tactical Overview */}
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-2xl flex-1">
           <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
             <Clock size={12} className="text-purple-400" /> Tactical Overview
           </h3>
           
           <div className="space-y-4">
             <div>
               <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Pit Window</div>
               <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{ width: `${(currentLap / totalLaps) * 100}%` }} />
               </div>
             </div>

             <div className="text-xs text-gray-400 italic">
               Waiting for strategic divergences to emerge in the data stream...
             </div>
           </div>
        </div>

      </div>

    </div>
  );
}
