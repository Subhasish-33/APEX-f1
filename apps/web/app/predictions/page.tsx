import React from 'react';
import PredictionCard from '../../components/Predictions/PredictionCard';
import HistoricalAccuracy from '../../components/Predictions/HistoricalAccuracy';
import ModelCard from '../../components/Predictions/ModelCard';
import { Activity } from 'lucide-react';

// Next.js page needs to be async to fetch data
export default async function PredictionsDashboard() {
  
  // In a real scenario, this would fetch from http://localhost:8000/predictions/race
  // For the dashboard build, we simulate the API payload based on the Day 17 schema.
  
  const mockPredictions = [
    {
      position: 1,
      driverRef: "VER",
      name: "Max Verstappen",
      constructorName: "Red Bull Racing",
      confidenceScore: 0.92,
      gridPosition: 1,
      predictionFactors: [
        "Dominant Constructor Performance (last 5 races)",
        "Pole Position advantage at this circuit",
        "Exceptional Historical Accuracy (95% win rate from P1)"
      ]
    },
    {
      position: 2,
      driverRef: "NOR",
      name: "Lando Norris",
      constructorName: "McLaren",
      confidenceScore: 0.81,
      gridPosition: 2,
      predictionFactors: [
        "Strong recent form (Avg finish P2.2)",
        "High correlation with grid position at this track"
      ]
    },
    {
      position: 3,
      driverRef: "LEC",
      name: "Charles Leclerc",
      constructorName: "Ferrari",
      confidenceScore: 0.65,
      gridPosition: 4,
      predictionFactors: [
        "Strong Qualifying Delta",
        "Ferrari straight-line speed advantage"
      ]
    },
    {
      position: 4,
      driverRef: "SAI",
      name: "Carlos Sainz",
      constructorName: "Ferrari",
      confidenceScore: 0.58,
      gridPosition: 3,
      predictionFactors: ["Consistent race pace", "Low tire degradation track"]
    },
    {
      position: 5,
      driverRef: "PIA",
      name: "Oscar Piastri",
      constructorName: "McLaren",
      confidenceScore: 0.45,
      gridPosition: 5,
      predictionFactors: []
    },
    {
      position: 6,
      driverRef: "PER",
      name: "Sergio Perez",
      constructorName: "Red Bull Racing",
      confidenceScore: 0.42,
      gridPosition: 8,
      predictionFactors: ["Car dominance offset by recent poor form"]
    },
    {
      position: 7,
      driverRef: "HAM",
      name: "Lewis Hamilton",
      constructorName: "Mercedes",
      confidenceScore: 0.38,
      gridPosition: 6,
      predictionFactors: []
    },
    {
      position: 8,
      driverRef: "RUS",
      name: "George Russell",
      constructorName: "Mercedes",
      confidenceScore: 0.35,
      gridPosition: 7,
      predictionFactors: []
    },
    {
      position: 9,
      driverRef: "ALO",
      name: "Fernando Alonso",
      constructorName: "Aston Martin",
      confidenceScore: 0.28,
      gridPosition: 9,
      predictionFactors: []
    },
    {
      position: 10,
      driverRef: "TSU",
      name: "Yuki Tsunoda",
      constructorName: "RB",
      confidenceScore: 0.21,
      gridPosition: 11,
      predictionFactors: []
    }
  ];

  return (
    <div className="min-h-screen bg-f1-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-f1-red w-5 h-5 animate-pulse" />
          <span className="text-f1-red font-mono text-sm tracking-widest uppercase">Live Inference Engine</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase">
          Abu Dhabi Grand Prix
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-sm">
          Race ID: 1144 • Model: XGBRanker v1.0 • Context Hash: 8f92a1b3c4
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Predictions */}
        <div className="xl:col-span-2 space-y-8">
          {/* We assume qualifying is done. If not, we'd render an empty state here */}
          <PredictionCard predictions={mockPredictions} />
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
