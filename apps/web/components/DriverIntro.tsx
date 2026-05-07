"use client";

import { useState, useRef } from "react";

export default function DriverIntro() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-[500px] mb-12 rounded-sm overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      
      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-f1-dark via-f1-dark/40 to-transparent z-10" />
      
      <div className="relative z-20 h-full flex flex-col justify-center px-12 max-w-2xl">
        <span className="bg-f1-red text-white text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full w-fit mb-6">
          Season 2026
        </span>
        <h2 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter italic leading-none mb-6">
          Meet The <span className="text-f1-red">Class of 2026</span>
        </h2>
        <p className="text-gray-200 text-lg font-medium leading-relaxed mb-8">
          20 drivers. 10 teams. One goal. Experience the data-driven journey of the world's most elite athletes as they push the limits of physics and performance.
        </p>
        
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">20</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Contenders</span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">10</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Teams</span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">24</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Grand Prix</span>
          </div>
        </div>
      </div>
      
      {/* 🔊 Sound Toggle Button */}
      <button 
        onClick={toggleMute}
        className="absolute bottom-8 right-8 z-40 bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-full hover:bg-f1-red transition-all group/sound"
      >
        {isMuted ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-f1-red via-f1-gold to-f1-red z-30" />
    </div>
  );
}
