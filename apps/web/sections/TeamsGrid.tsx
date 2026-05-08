"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CarViewer3D } from "@/components/CarViewer3D";
import { f1Teams2025 } from "@/data/f1Teams2025";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {teams.map((team, index) => (
            <TeamCard key={team.id} team={team} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ team, index }: { team: any; index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1] 
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

        {/* 3D Thumbnail - Lazy Loaded */}
        <div className="h-40 relative bg-black/40">
          {inView ? (
            <Suspense fallback={<div className="w-full h-full bg-white/5 animate-pulse" />}>
              <CarViewer3D 
                modelPath={team.modelPath} 
                teamColor={team.primaryColor} 
                hotspots={[]} 
              />
            </Suspense>
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
               <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10" />
            </div>
          )}
          
          {/* Logo Overlay */}
          <div className="absolute top-4 right-4 w-10 h-10 opacity-60 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm p-1.5 rounded-sm border border-white/10">
             <Image 
               src={`/assets/teams/${team.id}.png`} 
               alt={`${team.shortName} Logo`}
               width={40}
               height={40}
               className="object-contain w-full h-full grayscale group-hover:grayscale-0 transition-all"
               onError={(e) => {
                 // Fallback to team color circle if logo missing
                 (e.target as any).style.display = 'none';
               }}
             />
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
