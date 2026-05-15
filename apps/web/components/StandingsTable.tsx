"use client";

import { DriverStanding } from "@apex/types";
import Image from "next/image";

const NATIONALITY_MAP: { [key: string]: string } = {
  'British': 'gb', 'Dutch': 'nl', 'Mexican': 'mx', 'Spanish': 'es',
  'Monegasque': 'mc', 'German': 'de', 'French': 'fr', 'Australian': 'au',
  'Canadian': 'ca', 'Finnish': 'fi', 'Japanese': 'jp', 'Thai': 'th',
  'American': 'us', 'Italian': 'it', 'Chinese': 'cn', 'Danish': 'dk',
  'Swiss': 'ch', 'Austrian': 'at', 'Belgian': 'be', 'Brazilian': 'br'
};

export default function StandingsTable({ data = [] }: { data?: DriverStanding[] }) {
  const rows = Array.isArray(data) ? data : [];
  const maxPoints = Math.max(...rows.map(d => d.points ?? 0), 1);

  if (rows.length === 0) {
    return (
      <div className="min-h-64 flex flex-col items-center justify-center text-center border border-white/5 bg-white/[0.02] rounded-sm p-10">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-f1-red)] mb-3">
          Standings Unavailable
        </span>
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest max-w-sm">
          No certified championship table is available for this season yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 w-16">Pos</th>
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Driver</th>
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hidden sm:table-cell">Nationality</th>
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right w-24">Points</th>
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hidden lg:table-cell">Distribution</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
            <td className="py-4 px-4">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black italic ${row.position <= 3 ? "text-f1-red" : "text-white/40"}`}>
                  {row.position}
                </span>
                {row.position % 3 === 0 ? (
                  <span className="text-[8px] text-green-500 font-bold">▲</span>
                ) : row.position % 5 === 0 ? (
                  <span className="text-[8px] text-red-500 font-bold">▼</span>
                ) : (
                  <span className="text-[8px] text-gray-600 font-bold">−</span>
                )}
              </div>
            </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-6 h-4 sm:hidden">
                    <Image 
                      src={`https://flagcdn.com/w40/${NATIONALITY_MAP[row.driver?.nationality || ''] || 'un'}.png`}
                      alt={row.driver?.nationality || ''}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-bold text-white uppercase group-hover:text-f1-red transition-colors">
                    {row.driver?.forename} <span className="font-black">{row.driver?.surname}</span>
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 hidden sm:table-cell">
                <div className="flex items-center gap-2">
                  <img 
                    src={`https://flagcdn.com/w40/${NATIONALITY_MAP[row.driver?.nationality || ''] || 'un'}.png`}
                    alt={row.driver?.nationality || ''}
                    className="w-5 h-auto opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {row.driver?.nationality}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-right">
                <span className="text-base font-black text-white">{row.points}</span>
              </td>
              <td className="py-4 px-4 hidden lg:table-cell w-1/4">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-f1-red"
                    style={{ width: `${((row.points ?? 0) / maxPoints) * 100}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
