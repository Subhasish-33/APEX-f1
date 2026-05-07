"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CarViewer3D } from "@/components/CarViewer3D";
import { f1Teams2025 } from "@/data/f1Teams2025";
import Image from "next/image";

export function TeamsGrid() {
  const teams = Object.values(f1Teams2025);

  return (
    <section className="py-24 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-f1-red text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Official Grid</span>
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">The Class of 2025</h2>
          </div>
          <p className="text-white/40 text-sm max-w-xs text-right">
            Explore technical specifications and 3D chassis renders for all 10 constructors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {teams.map((team, index) => (
            <TeamCard key={team.id} team={team} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ team, index }: { team: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1] // Custom easeOutExpo
      }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Link 
        href={`/teams/${team.id}`}
        className="group block relative bg-white/5 border border-white/5 rounded-sm overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1"
      >
        {/* Team Color Glow Border (Active on Hover) */}
        <div 
          className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: team.primaryColor, boxShadow: `0 0 15px ${team.primaryColor}` }}
        />

        {/* 3D Thumbnail */}
        <div className="h-40 relative bg-black/40">
          <Suspense fallback={<div className="w-full h-full bg-white/5 animate-pulse" />}>
            <CarViewer3D 
              modelPath={team.modelPath} 
              teamColor={team.primaryColor} 
              hotspots={[]} // No hotspots in grid
            />
          </Suspense>
          
          {/* Logo Overlay */}
          <div className="absolute top-4 right-4 w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">
             {/* Using a placeholder for now, would be team.logoPath */}
             <div className="w-full h-full rounded-full" style={{ backgroundColor: team.primaryColor }} />
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Constructor</span>
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-[10px] font-black text-f1-red italic">#{index + 1}</span>
          </div>
          
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-f1-red transition-colors">
            {team.shortName}
          </h3>

          {/* Legacy Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/5">
            <div>
              <span className="block text-[8px] text-white/40 font-black uppercase tracking-widest mb-1">Titles</span>
              <span className="text-sm font-black text-white italic">{team.championships}</span>
            </div>
            <div>
              <span className="block text-[8px] text-white/40 font-black uppercase tracking-widest mb-1">Wins</span>
              <span className="text-sm font-black text-white italic">{team.totalWins}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 bg-white/5 text-white/60 text-[8px] font-bold uppercase tracking-widest rounded-full border border-white/5">
              {team.car.engineSupplier}
            </span>
            <span className="px-2 py-0.5 bg-white/5 text-white/60 text-[8px] font-bold uppercase tracking-widest rounded-full border border-white/5">
              {team.car.tyreSupplier}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
