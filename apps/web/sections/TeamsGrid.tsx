"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { f1Teams2025 } from "@/data/f1Teams2025";

export function TeamsGrid() {
  const teams = Object.values(f1Teams2025);

  return (
    <section className="py-24 bg-[var(--color-bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[var(--color-f1-red)] text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
              Official Grid
            </span>
            <h2 className="text-5xl font-black text-[var(--color-text-primary)] uppercase italic tracking-tighter">
              The Class of 2025
            </h2>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm max-w-xs text-right">
            Explore all 10 constructors competing in the 2025 Formula 1 World Championship.
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
    rootMargin: "200px 0px",
  });

  return (
    <div
      ref={ref}
      className={`transition-reveal ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      style={{ transitionDelay: `${index * 30}ms` }}
    >
      <Link
        href={`/teams/${team.id}`}
        className="group block relative bg-white/5 border border-white/5 rounded-sm overflow-hidden hover:border-white/20 transition-ui hover:-translate-y-1"
      >
        {/* Team Color Bottom Border (Active on Hover) */}
        <div
          className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-ui"
          style={{ backgroundColor: team.primaryColor }}
        />

        {/* Car Livery Image */}
        <div className="h-40 relative bg-black/40 overflow-hidden">
          <Image
            src={`/assets/cars/${team.id}.png`}
            alt={`${team.shortName} 2025 Car`}
            fill
            className="object-contain object-center p-4 opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-ui"
            onError={(e) => {
              // Fallback: show team color placeholder
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />

          {/* Logo Overlay */}
          <div className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm p-1.5 rounded-sm border border-white/10">
            <Image
              src={`/assets/teams/${team.id}.png`}
              alt={`${team.shortName} Logo`}
              width={40}
              height={40}
              className="object-contain w-full h-full opacity-60 group-hover:opacity-100 transition-ui"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
              Constructor
            </span>
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-[10px] font-black text-[var(--color-f1-red)] italic">
              #{index + 1}
            </span>
          </div>

          <h3 className="text-lg font-black text-[var(--color-text-primary)] uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-[var(--color-f1-red)] transition-ui">
            {team.shortName}
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/5">
            <div>
              <span className="block text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-widest mb-1">
                Titles
              </span>
              <span className="text-sm font-black text-[var(--color-text-primary)] italic font-data">
                {team.championships}
              </span>
            </div>
            <div>
              <span className="block text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-widest mb-1">
                Wins
              </span>
              <span className="text-sm font-black text-[var(--color-text-primary)] italic font-data">
                {team.totalWins}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 bg-white/5 text-[var(--color-text-secondary)] text-[8px] font-bold uppercase tracking-widest rounded-full border border-white/5">
              {team.car.engineSupplier}
            </span>
            <span className="px-2 py-0.5 bg-white/5 text-[var(--color-text-secondary)] text-[8px] font-bold uppercase tracking-widest rounded-full border border-white/5">
              {team.car.tyreSupplier}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
