"use client";

import { Result } from "@apex/types";
import { motion } from "framer-motion";
import { Zap, Timer, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

interface ResultsTableProps {
  results: Result[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-left">
            <th className="px-4 py-2">Pos</th>
            <th className="px-4 py-2">Driver</th>
            <th className="px-4 py-2">Constructor</th>
            <th className="px-4 py-2">Grid</th>
            <th className="px-4 py-2">Gap/Status</th>
            <th className="px-4 py-2">Points</th>
            <th className="px-4 py-2 text-right">Fastest Lap</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res, idx) => (
            <ResultRow key={res.result_id} result={res} index={idx} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultRow({ result, index }: { result: Result; index: number }) {
  const grid = result.grid || 0;
  const finish = result.position || 0;
  const delta = grid - finish;

  const fastestLap = result.fastest_lap_time;
  const isFastest = result.points % 1 !== 0; // Heuristic: points like 26, 19 usually mean fastest lap +1

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className="group bg-white/5 hover:bg-white/10 transition-colors"
    >
      <td className="px-4 py-4 rounded-l-lg border-l-2 border-transparent group-hover:border-f1-red transition-all">
        <span className="text-xl font-black italic text-white/80">{finish}</span>
      </td>
      
      <td className="px-4 py-4">
        <Link href={`/drivers/${result.driver?.driver_ref}`} className="flex flex-col hover:text-f1-red transition-colors">
          <span className="text-[10px] font-bold text-white/40 uppercase">{result.driver?.forename}</span>
          <span className="text-base font-black uppercase tracking-tight italic">{result.driver?.surname}</span>
        </Link>
      </td>

      <td className="px-4 py-4 text-xs font-bold text-white/60">
        {result.constructor?.name.toUpperCase()}
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white/40">{grid}</span>
          {delta > 0 ? (
            <TrendingUp size={12} className="text-green-500" />
          ) : delta < 0 ? (
            <TrendingDown size={12} className="text-f1-red" />
          ) : (
            <Minus size={12} className="text-white/10" />
          )}
          <span className={`text-[10px] font-black ${delta > 0 ? 'text-green-500' : delta < 0 ? 'text-f1-red' : 'text-white/20'}`}>
            {delta !== 0 && (delta > 0 ? `+${delta}` : delta)}
          </span>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`text-sm font-mono font-bold ${result.status === "Finished" ? 'text-white/80' : 'text-white/30'}`}>
          {result.time || result.status}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black italic">{result.points}</span>
          <span className="text-[8px] font-bold text-white/30">PTS</span>
        </div>
      </td>

      <td className="px-4 py-4 rounded-r-lg text-right">
        {fastestLap && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
            isFastest ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'border-white/5 text-white/20'
          }`}>
            <Timer size={12} />
            <span className="text-xs font-mono font-bold">{fastestLap}</span>
            {isFastest && <Zap size={10} className="fill-current" />}
          </div>
        )}
      </td>
    </motion.tr>
  );
}
