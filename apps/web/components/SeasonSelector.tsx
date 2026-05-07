"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SeasonSelector({ currentYear }: { currentYear: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const pathname = usePathname();
  
  const years = Array.from({ length: 17 }, (_, i) => 2026 - i);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="year" className="text-[10px] uppercase font-black tracking-widest text-gray-500">
        Season
      </label>
      <select
        id="year"
        value={currentYear}
        onChange={handleChange}
        className="bg-white/5 border border-white/10 text-white font-black uppercase text-sm rounded-sm px-4 py-2 focus:ring-1 focus:ring-f1-red outline-none"
      >
        {years.map((y) => (
          <option key={y} value={y} className="bg-f1-dark text-white">
            {y} SEASON
          </option>
        ))}
      </select>
    </div>
  );
}
