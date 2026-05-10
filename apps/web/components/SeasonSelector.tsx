"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function SeasonSelector({ currentYear }: { currentYear: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const years = Array.from({ length: 16 }, (_, i) => 2025 - i); // 2025 down to 2010

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="season-selector"
        className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]"
      >
        Season
      </label>
      <select
        id="season-selector"
        value={currentYear}
        onChange={handleChange}
        className="bg-white/5 border border-white/10 text-[var(--color-text-primary)] font-black uppercase text-sm rounded-sm px-4 py-2 focus:ring-1 focus:ring-[var(--color-f1-red)] outline-none"
      >
        {years.map((y) => (
          <option key={y} value={y} className="bg-[var(--color-bg-secondary)] text-white">
            {y} Season
          </option>
        ))}
      </select>
    </div>
  );
}

export default SeasonSelector;
