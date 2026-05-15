import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RaceResult {
  race?: {
    name: string;
    date: string;
    circuit?: {
      name: string;
    }
  };
  grid: number;
  position?: number;
  points: number;
}

export default function RecentForm({ results }: { results: RaceResult[] }) {
  if (!results || results.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-white/10 rounded-sm">
        <p className="text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-[0.4em]">Signal Lost: No Telemetry</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map((r, i) => {
        const delta = r.grid - (r.position || r.grid);
        const isUp = delta > 0;
        const isDown = delta < 0;
        
        return (
          <div 
            key={i} 
            className="group relative flex items-center bg-[var(--color-bg-secondary)] border-l-2 transition-all duration-500 hover:bg-white/[0.04]"
            style={{ borderLeftColor: isUp ? 'var(--color-success)' : isDown ? 'var(--color-danger)' : 'rgba(255,255,255,0.1)' }}
          >
            {/* Sector Marker */}
            <div className="w-12 h-full absolute -left-12 flex flex-col items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity">
               <span className="text-[8px] font-black text-white vertical-type tracking-widest uppercase">S{i+1}</span>
               <div className="w-[1px] flex-1 bg-white/20 mt-2" />
            </div>

            <div className="flex-1 py-4 px-6 grid grid-cols-12 gap-4 items-center">
               {/* Race ID */}
               <div className="col-span-4 flex flex-col">
                  <span className="text-[10px] font-data font-black text-white uppercase tracking-tighter leading-tight">
                    {(r.race?.name ?? "Unknown Grand Prix").replace(" Grand Prix", "").toUpperCase()}
                  </span>
                  <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                    {r.race?.date ? new Date(r.race.date).getFullYear() : "----"} / RD {results.length - i}
                  </span>
               </div>

               {/* Delta Viz */}
               <div className="col-span-4 flex items-center gap-4">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase mb-1">Grid</span>
                     <span className="text-xs font-data font-black text-white">P{r.grid}</span>
                  </div>
                  <div className="flex-1 h-1 bg-white/5 relative rounded-full overflow-hidden">
                     <div 
                       className={cn(
                        "absolute h-full transition-all duration-1000 ease-mechanical",
                        isUp ? "bg-success right-1/2" : isDown ? "bg-danger left-1/2" : "bg-white/20 left-1/2 w-1"
                       )}
                       style={{ 
                         width: isUp || isDown ? `${Math.min(Math.abs(delta) * 10, 50)}%` : "2px",
                       }}
                     />
                  </div>
                  <div className="flex flex-col items-start">
                     <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase mb-1">Finish</span>
                     <span className={cn("text-xs font-data font-black", r.position === 1 ? "text-gold" : "text-white")}>
                        P{r.position || "DNF"}
                     </span>
                  </div>
               </div>

               {/* Delta Text */}
               <div className="col-span-2 text-center">
                  {isUp ? (
                    <span className="text-[10px] font-data font-black text-success">+{delta}</span>
                  ) : isDown ? (
                    <span className="text-[10px] font-data font-black text-danger">{delta}</span>
                  ) : (
                    <span className="text-[10px] font-data font-black text-white/20">—</span>
                  )}
               </div>

               {/* Points */}
               <div className="col-span-2 text-right">
                  <span className="text-xs font-data font-black text-[var(--color-f1-red)] italic">
                    {r.points > 0 ? `+${r.points}` : "00"}
                  </span>
                  <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase ml-1">pts</span>
               </div>
            </div>
            
            {/* Precision Micro-Detail */}
            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white/20" />
            <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white/20" />
          </div>
        );
      })}
    </div>
  );
}
