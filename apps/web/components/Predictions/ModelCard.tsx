import React from 'react';

export default function ModelCard() {
  return (
    <div className="bg-f1-black/90 border border-f1-red/20 rounded-lg p-6 shadow-[0_0_20px_rgba(255,24,1,0.05)] backdrop-blur-md">
      <h3 className="text-xl font-bold tracking-widest text-f1-white mb-6 uppercase">
        Intelligence Engine Governance
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-f1-red tracking-wider uppercase">Model Identity</h4>
          <dl className="space-y-2">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-gray-400">Architecture</dt>
              <dd className="text-white font-mono text-sm">XGBRanker v1.0</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-gray-400">Training Eras</dt>
              <dd className="text-white font-mono text-sm">2010 - 2021</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-gray-400">Temporal Validation</dt>
              <dd className="text-white font-mono text-sm">2022 - 2024</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-gray-400">Calibration Quality</dt>
              <dd className="text-green-400 font-mono text-sm">Valid (Isotonic)</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-f1-red tracking-wider uppercase">Known Limitations</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-f1-red">▪</span> 
              <span>Model has NO awareness of mid-race incidents (Safety Cars, red flags).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-f1-red">▪</span> 
              <span>Weather data is probabilistic; rain predictions carry high entropy.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-f1-red">▪</span> 
              <span>New drivers or teams with &lt; 3 races have highly degraded feature quality.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-f1-red">▪</span> 
              <span>Performance temporarily degrades following major regulation shifts (e.g., 2022, 2026).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
