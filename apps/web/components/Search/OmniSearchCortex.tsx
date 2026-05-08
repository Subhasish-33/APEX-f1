"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Activity, Users, Flag, Layers, X, Command, Sparkles, TrendingUp } from "lucide-react";
import { api } from "../../lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function OmniSearchCortex() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [intent, setIntent] = useState("GENERAL");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const performSearch = useCallback(async (q: string) => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.unifiedSearch(q);
      setResults(data.results);
      setSuggestions(data.suggestions);
      setIntent(data.intent);
      setSelectedIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelect = (result: any) => {
    setIsOpen(false);
    if (result.type === "DRIVER") router.push(`/drivers/${result.ref}`);
    if (result.type === "TEAM") router.push(`/constructors/${result.ref}`);
    if (result.type === "RACE") router.push(`/races/${result.id}`);
    if (result.action === "JUMP_TO_BATTLE") router.push(`/compare`);
  };

  const activeAtmosphere = getAtmosphereForIntent(intent, results[selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-4xl bg-black border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col transition-cinematic ${activeAtmosphere.glow}`}
          >
            {/* Header / Input */}
            <div className="p-6 border-b border-white/5 flex items-center gap-6">
               <div className={`p-3 rounded-2xl ${activeAtmosphere.iconBg} transition-cinematic`}>
                  <Search size={24} className={activeAtmosphere.iconColor} />
               </div>
               <input
                 ref={inputRef}
                 type="text"
                 placeholder="Search rivalries, concepts, drivers..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 className="flex-1 bg-transparent border-none outline-none text-2xl font-black italic uppercase tracking-tighter placeholder:text-white/10"
               />
               <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                  <Command size={12} className="text-white/20" />
                  <span className="text-[10px] font-black text-white/40">K</span>
               </div>
            </div>

            <div className="flex-1 flex min-h-[500px]">
               {/* Results Column */}
               <div className="flex-1 p-4 overflow-y-auto max-h-[600px] custom-scrollbar border-r border-white/5">
                  {results.length > 0 ? (
                    <div className="space-y-2">
                       {results.map((res, i) => (
                         <div 
                           key={i}
                           onMouseEnter={() => setSelectedIndex(i)}
                           onClick={() => handleSelect(res)}
                           className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-cinematic ${
                             i === selectedIndex ? "bg-white/10" : "hover:bg-white/5"
                           }`}
                         >
                            <div className="flex items-center gap-4">
                               <ResultIcon type={res.type} />
                               <div>
                                  <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">{res.type}</div>
                                  <div className="text-lg font-black italic text-white uppercase tracking-tighter">{res.label}</div>
                               </div>
                            </div>
                            {res.reason && (
                               <div className="px-3 py-1 bg-f1-red/10 border border-f1-red/20 rounded-full flex items-center gap-2">
                                  <Sparkles size={10} className="text-f1-red" />
                                  <span className="text-[8px] font-black text-f1-red uppercase tracking-widest">Intelligence Match</span>
                               </div>
                            )}
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 text-center p-12">
                       <Layers size={48} className="mb-6" />
                       <p className="text-[10px] font-black uppercase tracking-[0.5em]">The Intelligence Cortex is listening...</p>
                    </div>
                  )}
               </div>

               {/* Discovery / Preview Sidebar */}
               <div className="w-80 bg-white/[0.02] p-8 flex flex-col gap-8 overflow-hidden">
                  <AnimatePresence mode="wait">
                     {results[selectedIndex] ? (
                        <motion.div 
                          key={results[selectedIndex].id || results[selectedIndex].label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-8"
                        >
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Intelligence Insight</h4>
                              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                 <p className="text-xs font-bold text-white/60 leading-relaxed italic uppercase">
                                   {results[selectedIndex].reason || "Highly relevant entity identified in the current championship arc."}
                                 </p>
                                 <div className="flex items-center gap-2 text-f1-red">
                                    <Activity size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Momentum Detected</span>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Deep Discoveries</h4>
                              <div className="space-y-2">
                                 {suggestions.slice(0, 3).map((s, i) => (
                                   <button key={i} onClick={() => setQuery(s)} className="w-full text-left p-3 hover:bg-white/5 rounded-xl transition-cinematic">
                                      <span className="text-[10px] font-black text-white uppercase tracking-tighter opacity-40 hover:opacity-100 transition-cinematic">{s}</span>
                                   </button>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                     ) : (
                        <div className="space-y-8 opacity-40">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Central Nervous System</h4>
                              <p className="text-xs font-medium text-white/40 leading-relaxed italic uppercase">
                                APEX Omni-Search utilizes stochastic intent mapping to anticipate your strategic needs.
                              </p>
                           </div>
                        </div>
                     )}
                  </AnimatePresence>
               </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
               <div className="flex gap-6">
                  <span>Enter to View</span>
                  <span>Shift+Enter to Compare</span>
                  <span>Esc to Close</span>
               </div>
               <div className="flex items-center gap-2">
                  <Sparkles size={10} className="text-f1-gold" />
                  <span>Semantic Intelligence Active</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ResultIcon({ type }: { type: string }) {
  switch (type) {
    case "DRIVER": return <Users size={18} className="text-f1-red" />;
    case "TEAM": return <Flag size={18} className="text-f1-red" />;
    case "RACE": return <Activity size={18} className="text-f1-red" />;
    case "SHORTCUT": return <Zap size={18} className="text-f1-gold" />;
    default: return <Search size={18} className="text-white/40" />;
  }
}

function getAtmosphereForIntent(intent: string, activeResult: any) {
  if (intent === "DUEL") return { glow: "shadow-[0_0_100px_rgba(225,6,0,0.2)] border-f1-red/30", iconBg: "bg-f1-red/10", iconColor: "text-f1-red" };
  if (intent === "WET_MASTERY") return { glow: "shadow-[0_0_100px_rgba(0,120,255,0.2)] border-blue-500/30", iconBg: "bg-blue-500/10", iconColor: "text-blue-500" };
  if (intent === "CHAOS") return { glow: "shadow-[0_0_100px_rgba(255,215,0,0.2)] border-f1-gold/30", iconBg: "bg-f1-gold/10", iconColor: "text-f1-gold" };
  
  if (activeResult?.type === "TEAM") {
     return { glow: "shadow-[0_0_100px_rgba(255,255,255,0.05)] border-white/20", iconBg: "bg-white/5", iconColor: "text-white" };
  }
  
  return { glow: "border-white/10", iconBg: "bg-white/5", iconColor: "text-white/40" };
}
