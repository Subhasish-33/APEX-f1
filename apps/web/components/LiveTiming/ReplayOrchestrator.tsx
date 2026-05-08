"use client";
import React, { useState, useEffect, useRef } from 'react';
import CinematicTrackMap from './CinematicTrackMap';
import MissionControlHUD from './MissionControlHUD';

interface ReplayOrchestratorProps {
  raceId: number;
}

export default function ReplayOrchestrator({ raceId }: ReplayOrchestratorProps) {
  const [lapData, setLapData] = useState<any[]>([]);
  const [currentLap, setCurrentLap] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch simulation data on mount
  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        const res = await fetch(`http://localhost:8000/races/${raceId}/simulation`);
        if (res.ok) {
          const data = await res.json();
          setLapData(data);
        } else {
          console.error("Failed to load simulation data");
        }
      } catch (err) {
        console.error("Simulation API error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSimulation();
  }, [raceId]);

  // Orchestration Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && lapData.length > 0) {
      // Base tick is 3 seconds for 1x.
      const tickDuration = 3000 / playbackSpeed;
      
      interval = setInterval(() => {
        setCurrentLap(prev => {
          if (prev >= lapData.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, tickDuration);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, lapData.length]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-black rounded-xl border border-white/10 flex items-center justify-center">
        <div className="text-f1-red font-mono animate-pulse tracking-widest uppercase">Initializing Telemetry Stream...</div>
      </div>
    );
  }

  if (!lapData || lapData.length === 0) {
    return (
      <div className="w-full h-[600px] bg-black rounded-xl border border-white/10 flex items-center justify-center">
        <div className="text-gray-500 font-mono tracking-widest uppercase text-xs">No Telemetry Available for Race {raceId}</div>
      </div>
    );
  }

  const activePositions = lapData.find(l => l.lap === currentLap)?.positions || [];

  return (
    <div className="relative w-full rounded-xl overflow-hidden group">
      <CinematicTrackMap currentLapData={activePositions} />
      
      <MissionControlHUD 
        currentLap={currentLap}
        totalLaps={lapData.length}
        positions={activePositions}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onSpeedChange={setPlaybackSpeed}
      />
    </div>
  );
}
