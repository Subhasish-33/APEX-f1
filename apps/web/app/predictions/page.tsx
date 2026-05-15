import React from 'react';
import PredictionCard from '../../components/Predictions/PredictionCard';
import HistoricalAccuracy from '../../components/Predictions/HistoricalAccuracy';
import ModelCard from '../../components/Predictions/ModelCard';
import { Activity } from 'lucide-react';

export default async function PredictionsDashboard() {
  return (
    <div className="min-h-screen bg-f1-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-f1-red w-5 h-5 animate-pulse" />
          <span className="text-f1-red font-mono text-sm tracking-widest uppercase">Live Inference Engine</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase">
          Prediction Intelligence
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-sm">
          Forecasts remain unavailable until a certified race context and model artifact are present.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Predictions */}
        <div className="xl:col-span-2 space-y-8">
          <PredictionCard predictions={[]} />
        </div>

        {/* Right Column: Model Info & Accuracy */}
        <div className="space-y-8">
          <ModelCard />
          <HistoricalAccuracy />
        </div>

      </div>
    </div>
  );
}
