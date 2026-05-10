"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { F1_DRIVERS_2025 } from "@/lib/constants/drivers";
import { f1Teams2025 } from "@/data/f1Teams2025";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<"drivers" | "teams" | null>(null);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (type: "drivers" | "teams") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(type);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav
      className="bg-[var(--color-bg-primary)] border-b border-white/5 sticky top-0 z-[100]"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="text-f1-red font-black text-3xl tracking-tighter italic group-hover:scale-105 transition-cinematic">
                APEX<span className="text-white">F1</span>
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-2">
              <Link 
                href="/drivers"
                onMouseEnter={() => handleMouseEnter("drivers")}
                className={`flex items-center gap-1 px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-cinematic ${
                  activeDropdown === "drivers" || pathname.startsWith("/drivers") ? "text-white" : "text-white/40 hover:text-white"
                }`}
              >
                Drivers <ChevronDown size={12} className={`transition-cinematic ${activeDropdown === "drivers" ? 'rotate-180' : ''}`} />
              </Link>
              
              <Link 
                href="/teams"
                onMouseEnter={() => handleMouseEnter("teams")}
                className={`flex items-center gap-1 px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-cinematic ${
                  activeDropdown === "teams" || pathname.startsWith("/teams") ? "text-white" : "text-white/40 hover:text-white"
                }`}
              >
                Teams <ChevronDown size={12} className={`transition-cinematic ${activeDropdown === "teams" ? 'rotate-180' : ''}`} />
              </Link>

              <Link href="/calendar" className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-cinematic">
                Schedule
              </Link>
              <Link href="/predictions" className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-cinematic">
                Predictions
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center">
            <div className="bg-red-600 h-10 px-6 flex items-center rounded-sm group cursor-pointer relative overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-cinematic" />
               <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] italic relative z-10">Live Race</span>
            </div>
          </div>
        </div>
      </div>

      {/* DROPDOWN MENU — CSS transition, no Framer Motion */}
      <div
        className={`absolute left-0 right-0 bg-[var(--color-bg-secondary)] border-b border-white/5 shadow-2xl z-[90] transition-ui overflow-hidden ${
          activeDropdown
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
        onMouseEnter={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
      >
            <div className="max-w-7xl mx-auto px-8 py-12">
              {activeDropdown === "drivers" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-8">
                  {F1_DRIVERS_2025.map((driver) => (
                    <Link 
                      key={driver.id}
                      href={`/drivers/${driver.id}`}
                      className="group flex items-center gap-4 p-2 rounded-sm hover:bg-white/5 transition-cinematic"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 relative border border-white/10 group-hover:border-f1-red/50 transition-cinematic">
                        <Image src={driver.headshot} alt={driver.surname} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{driver.name}</span>
                          <span className="text-[10px] opacity-60">
                            {driver.nationality === "United Kingdom" ? "🇬🇧" : 
                             driver.nationality === "Netherlands" ? "🇳🇱" :
                             driver.nationality === "Monaco" ? "🇲🇨" :
                             driver.nationality === "Australia" ? "🇦🇺" :
                             driver.nationality === "Italy" ? "🇮🇹" :
                             driver.nationality === "Spain" ? "🇪🇸" :
                             driver.nationality === "France" ? "🇫🇷" :
                             driver.nationality === "Canada" ? "🇨🇦" :
                             driver.nationality === "Brazil" ? "🇧🇷" :
                             driver.nationality === "Mexico" ? "🇲🇽" :
                             driver.nationality === "Germany" ? "🇩🇪" : "🏳️"}
                          </span>
                        </div>
                        <div className="text-sm font-black text-white uppercase italic group-hover:text-f1-red transition-cinematic">{driver.surname}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(f1Teams2025).map((team) => (
                    <Link 
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="group block bg-white/5 border border-white/5 rounded-sm p-4 hover:border-white/20 transition-cinematic hover:bg-white/[0.07]"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: team.primaryColor }} />
                          <span className="text-xs font-black text-white uppercase italic">{team.shortName}</span>
                        </div>
                        <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">
                          {team.car.engineSupplier}
                        </span>
                      </div>
                      {/* Car Side Profile */}
                      <div className="h-24 relative opacity-60 group-hover:opacity-100 transition-cinematic flex items-end justify-center py-4">
                         <div className="w-full h-[1px] bg-white/10 absolute bottom-0" />
                         <div className="relative w-full h-full">
                           <Image 
                             src={`/assets/cars/${team.id}.png`}
                             alt={`${team.shortName} Car`}
                             fill
                             className="object-contain object-bottom transition-cinematic group-hover:scale-110"
                             onError={(e) => {
                               (e.target as any).style.opacity = '0';
                             }}
                           />
                         </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                 <button className="px-8 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-cinematic">
                    View All {activeDropdown === "drivers" ? "Drivers" : "Teams"}
                 </button>
                 <button className="px-8 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-cinematic">
                    Historical Archives
                 </button>
              </div>
            </div>
      </div>
    </nav>
  );
}
