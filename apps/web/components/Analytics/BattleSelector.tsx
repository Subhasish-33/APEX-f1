"use client";

import { useState, useEffect } from "react";
import { Driver } from "@apex/types";
import { Search, User, ChevronDown } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface BattleSelectorProps {
  drivers: Driver[];
  selectedDriverId: number | null;
  onSelect: (id: number) => void;
  label: string;
}

export function BattleSelector({ drivers, selectedDriverId, onSelect, label }: BattleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const selectedDriver = drivers.find(d => d.driver_id === selectedDriverId);
  const filteredDrivers = drivers.filter(d => 
    d.surname.toLowerCase().includes(search.toLowerCase()) || 
    d.forename.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-sm">
      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3 ml-4">{label}</h4>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-f1-red/30 transition-all text-left"
      >
        <div className="flex items-center gap-4">
           <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-f1-red/50 transition-all bg-black/40">
              {selectedDriver ? (
                <Image src={`/assets/headshots/${selectedDriver.driver_ref}.png`} fill alt={selectedDriver.surname} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                   <User size={20} />
                </div>
              )}
           </div>
           <div>
              <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">{selectedDriver?.code || "SEL"}</div>
              <div className="text-lg font-black italic text-white uppercase tracking-tighter">
                {selectedDriver ? selectedDriver.surname : "SELECT WARRIOR"}
              </div>
           </div>
        </div>
        <ChevronDown size={16} className={`text-white/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 mt-4 w-full bg-f1-dark/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
             <div className="p-4 border-b border-white/5">
                <div className="relative">
                   <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                   <input 
                     autoFocus
                     type="text"
                     placeholder="Search driver..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-xs font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-f1-red/50 transition-all"
                   />
                </div>
             </div>

             <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {filteredDrivers.map(driver => (
                  <button
                    key={driver.driver_id}
                    onClick={() => { onSelect(driver.driver_id); setIsOpen(false); }}
                    className="w-full flex items-center gap-4 p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors text-left"
                  >
                     <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                        <Image src={`/assets/headshots/${driver.driver_ref}.png`} fill alt={driver.surname} className="object-cover" />
                     </div>
                     <div className="flex-1">
                        <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">{driver.code}</div>
                        <div className="text-sm font-black text-white uppercase tracking-tighter">{driver.forename} {driver.surname}</div>
                     </div>
                  </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
