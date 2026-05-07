"use client";

import { useCountdown } from "@/hooks/useCountdown";

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <div className="text-f1-red font-black text-2xl uppercase italic animate-pulse">
        Race in Progress
      </div>
    );
  }

  return (
    <div className="flex gap-4 sm:gap-8">
      <TimeUnit value={days} label="Days" />
      <TimeUnit value={hours} label="Hrs" />
      <TimeUnit value={minutes} label="Min" />
      <TimeUnit value={seconds} label="Sec" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/5 border border-white/10 rounded-sm px-3 py-2 sm:px-6 sm:py-4 min-w-[60px] sm:min-w-[100px] flex items-center justify-center">
        <span className="text-2xl sm:text-5xl font-black text-white tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold">
        {label}
      </span>
    </div>
  );
}
