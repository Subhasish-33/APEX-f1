"use client";

import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, Clock, ShieldCheck, ZapOff } from "lucide-react";

interface StorylineCardProps {
  title: string;
  driver: string;
  description: string;
  type: "positive" | "negative" | "technical" | "hero";
  metadata: string;
}

export function StorylineCard({ title, driver, description, type, metadata }: StorylineCardProps) {
  const icons = {
    positive: <TrendingUp className="text-green-500" />,
    negative: <TrendingDown className="text-f1-red" />,
    technical: <Clock className="text-f1-gold" />,
    hero: <ShieldCheck className="text-blue-400" />
  };

  const borders = {
    positive: "border-green-500/30 bg-green-500/5",
    negative: "border-f1-red/30 bg-f1-red/5",
    technical: "border-f1-gold/30 bg-f1-gold/5",
    hero: "border-blue-400/30 bg-blue-400/5"
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`border rounded-[2.5rem] p-8 ${borders[type]} backdrop-blur-xl relative overflow-hidden group cursor-pointer transition-all`}
    >
      <div className="absolute top-0 left-0 p-8 opacity-5">
         <Zap size={80} />
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-black/40 rounded-2xl border border-white/10 group-hover:bg-f1-red group-hover:border-f1-red transition-all">
          {icons[type]}
        </div>
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{metadata}</span>
      </div>

      <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">{driver}</h4>
      <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-4 group-hover:text-f1-red transition-colors">{title}</h3>
      <p className="text-sm font-medium text-white/50 leading-relaxed">
        {description}
      </p>

      {/* Narrative Footer */}
      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-f1-red animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">AI Intelligence Core</span>
         </div>
         <ZapOff size={14} className="text-white/10" />
      </div>
    </motion.div>
  );
}
