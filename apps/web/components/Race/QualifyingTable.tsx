"use client";

import { Qualifying } from "@apex/types";
import { motion } from "framer-motion";
import { Timer, Trophy } from "lucide-react";
import Link from "next/link";

interface QualifyingTableProps {
  qualifying: Qualifying[];
}

export function QualifyingTable({ qualifying }: QualifyingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-left">
            <th className="px-4 py-2">Pos</th>
            <th className="px-4 py-2">Driver</th>
            <th className="px-4 py-2">Constructor</th>
            <th className="px-4 py-2">Q1</th>
            <th className="px-4 py-2">Q2</th>
            <th className="px-4 py-2">Q3</th>
            <th className="px-4 py-2 text-right">Delta</th>
          </tr>
        </thead>
        <tbody>
          {qualifying.sort((a, b) => a.position - b.position).map((q, idx) => (
            <QualyRow key={idx} qualifying={q} index={idx} firstTime={qualifying[0]?.q3 || qualifying[0]?.q1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QualyRow({ qualifying, index, firstTime }: { qualifying: Qualifying; index: number; firstTime?: string }) {
  const p1Time = firstTime ? timeToMs(firstTime) : 0;
  const currentTime = qualifying.q3 ? timeToMs(qualifying.q3) : (qualifying.q2 ? timeToMs(qualifying.q2) : timeToMs(qualifying.q1 || ""));
  const delta = (currentTime && p1Time) ? ((currentTime - p1Time) / 1000).toFixed(3) : null;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className="group bg-white/5 hover:bg-white/10 transition-colors"
    >
      <td className="px-4 py-4 rounded-l-lg border-l-2 border-transparent group-hover:border-f1-red transition-all">
        <span className="text-xl font-black italic text-white/80">{qualifying.position}</span>
      </td>
      
      <td className="px-4 py-4">
        <Link href={`/drivers/${qualifying.driver?.driver_ref}`} className="flex flex-col hover:text-f1-red transition-colors">
          <span className="text-[10px] font-bold text-white/40 uppercase">{qualifying.driver?.forename}</span>
          <span className="text-base font-black uppercase tracking-tight italic">{qualifying.driver?.surname}</span>
        </Link>
      </td>

      <td className="px-4 py-4 text-xs font-bold text-white/60">
        {qualifying.constructor?.name.toUpperCase()}
      </td>

      <td className="px-4 py-4">
        <TimeCell time={qualifying.q1} />
      </td>

      <td className="px-4 py-4">
        <TimeCell time={qualifying.q2} />
      </td>

      <td className="px-4 py-4">
        <TimeCell time={qualifying.q3} highlight={qualifying.position === 1} />
      </td>

      <td className="px-4 py-4 rounded-r-lg text-right">
        {delta && delta !== "0.000" ? (
          <span className="text-xs font-mono font-bold text-white/30">+{delta}s</span>
        ) : qualifying.position === 1 ? (
           <Trophy size={14} className="text-f1-gold inline" />
        ) : null}
      </td>
    </motion.tr>
  );
}

function TimeCell({ time, highlight }: { time?: string; highlight?: boolean }) {
  if (!time) return <span className="text-white/5 text-xs font-bold uppercase">—</span>;
  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border transition-all ${
      highlight ? 'bg-f1-gold/20 border-f1-gold/50 text-f1-gold' : 'border-white/5 text-white/80'
    }`}>
      <span className="text-xs font-mono font-bold">{time}</span>
    </div>
  );
}

function timeToMs(time: string): number | null {
  if (!time || !time.includes(":")) return null;
  const [min, rest] = time.split(":");
  const [sec, ms] = rest.split(".");
  return (parseInt(min) * 60 * 1000) + (parseInt(sec) * 1000) + parseInt(ms);
}
