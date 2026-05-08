"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface PredictionItemProps {
  position: int;
  driverRef: string;
  name: string;
  constructorName: string;
  confidenceScore: float;
  gridPosition: int;
  predictionFactors: string[];
}

const getGradient = (position: number) => {
  if (position === 1) return "from-yellow-400 to-yellow-600";
  if (position === 2) return "from-gray-300 to-gray-400";
  if (position === 3) return "from-amber-600 to-amber-800";
  return "from-blue-500 to-cyan-400";
};

const getConfidenceLabel = (score: number) => {
  if (score >= 0.75) return { label: "HIGH", color: "text-green-400" };
  if (score >= 0.4) return { label: "MEDIUM", color: "text-yellow-400" };
  return { label: "LOW", color: "text-red-400" };
};

export default function PredictionCard({ predictions }: { predictions: PredictionItemProps[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-f1-black/90 border border-white/10 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-f1-red/10 to-transparent">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
          <Zap className="text-f1-red w-6 h-6" />
          Intelligence Forecast
        </h2>
        <p className="text-sm text-gray-400 mt-2">Ranked probability distribution from the APEX-F1 Engine</p>
      </div>

      <div className="divide-y divide-white/5">
        {predictions.map((pred) => {
          const isExpanded = expandedId === pred.driverRef;
          const conf = getConfidenceLabel(pred.confidenceScore);
          
          return (
            <div key={pred.driverRef} className="group hover:bg-white/5 transition-colors">
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => toggleExpand(pred.driverRef)}
              >
                {/* Position Badge */}
                <div className="w-10 h-10 flex items-center justify-center font-black text-xl italic text-white bg-white/10 rounded">
                  P{pred.position}
                </div>
                
                {/* Photo Placeholder */}
                <div className="w-12 h-12 rounded-full bg-gray-800 border border-white/20 overflow-hidden flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-mono">{pred.driverRef}</span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="text-lg font-bold text-white uppercase tracking-wider">{pred.name}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">{pred.constructorName}</div>
                </div>

                {/* Confidence Bar */}
                <div className="hidden md:flex flex-col w-48 mr-4">
                  <div className="flex justify-between text-[10px] mb-1 font-mono tracking-wider">
                    <span className="text-gray-400">CONFIDENCE</span>
                    <span className={conf.color}>{conf.label}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getGradient(pred.position)}`} 
                      style={{ width: `${Math.max(15, pred.confidenceScore * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Grid Position */}
                <div className="text-center w-16 hidden sm:block">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Grid</div>
                  <div className="text-lg font-mono text-white">P{pred.gridPosition}</div>
                </div>

                {/* Expand Toggle */}
                <div className="text-gray-500 group-hover:text-white transition-colors">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Explainability Section */}
              {isExpanded && (
                <div className="px-16 pb-4 pt-2 bg-black/40 border-t border-white/5">
                  <h4 className="text-xs font-semibold text-f1-red tracking-widest uppercase mb-3">Why this prediction?</h4>
                  <ul className="space-y-2">
                    {pred.predictionFactors.map((factor, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-gray-300 items-start">
                        <span className="text-f1-red mt-0.5">▪</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                    {pred.predictionFactors.length === 0 && (
                      <li className="text-sm text-gray-500 italic">No strong deterministic factors isolated for this ranking. Highly volatile.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
