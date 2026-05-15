import React from 'react';

export default function HistoricalAccuracy() {
  return (
    <div className="bg-f1-black/90 border border-white/10 rounded-lg p-6 shadow-xl backdrop-blur-md">
      <h3 className="text-xl font-bold tracking-widest text-f1-white mb-6 uppercase border-b border-white/10 pb-4">
        Historical Model Accuracy
      </h3>
      <div className="min-h-48 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-sm">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
          Calibration Ledger Empty
        </span>
        <p className="text-sm text-gray-500 mt-3 max-w-sm">
          Historical accuracy will render from certified prediction audits only.
        </p>
      </div>
    </div>
  );
}
