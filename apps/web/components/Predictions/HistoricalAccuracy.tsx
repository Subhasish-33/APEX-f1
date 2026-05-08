import React from 'react';

// Mock data for accuracy
const mockAccuracyData = [
  { race: "Las Vegas Grand Prix", year: 2023, predictions: ["VER", "LEC", "PER"], actuals: ["VER", "LEC", "PER"] },
  { race: "São Paulo Grand Prix", year: 2023, predictions: ["VER", "NOR", "HAM"], actuals: ["VER", "NOR", "ALO"] },
  { race: "Mexico City Grand Prix", year: 2023, predictions: ["VER", "HAM", "LEC"], actuals: ["VER", "HAM", "LEC"] },
  { race: "United States Grand Prix", year: 2023, predictions: ["VER", "NOR", "SAI"], actuals: ["VER", "NOR", "SAI"] },
  { race: "Qatar Grand Prix", year: 2023, predictions: ["VER", "PIA", "NOR"], actuals: ["VER", "PIA", "NOR"] },
];

export default function HistoricalAccuracy() {
  
  const getStatusColor = (predicted: string, actual: string, index: number, actuals: string[]) => {
    if (predicted === actual) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (actuals.includes(predicted)) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-f1-red/20 text-f1-red border-f1-red/30";
  };

  return (
    <div className="bg-f1-black/90 border border-white/10 rounded-lg p-6 shadow-xl backdrop-blur-md">
      <h3 className="text-xl font-bold tracking-widest text-f1-white mb-6 uppercase border-b border-white/10 pb-4">
        Historical Model Accuracy
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">
              <th className="pb-3 pr-4 font-semibold">Race</th>
              <th className="pb-3 px-2 font-semibold text-center">P1 (AI / Act)</th>
              <th className="pb-3 px-2 font-semibold text-center">P2 (AI / Act)</th>
              <th className="pb-3 pl-2 font-semibold text-center">P3 (AI / Act)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockAccuracyData.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors duration-200">
                <td className="py-4 pr-4">
                  <div className="font-semibold text-white text-sm">{row.race}</div>
                  <div className="text-xs text-gray-500">{row.year}</div>
                </td>
                
                {/* P1 */}
                <td className="py-4 px-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(row.predictions[0], row.actuals[0], 0, row.actuals)}`}>
                      {row.predictions[0]}
                    </span>
                    <span className="text-[10px] text-gray-500 tracking-wider">ACT: {row.actuals[0]}</span>
                  </div>
                </td>

                {/* P2 */}
                <td className="py-4 px-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(row.predictions[1], row.actuals[1], 1, row.actuals)}`}>
                      {row.predictions[1]}
                    </span>
                    <span className="text-[10px] text-gray-500 tracking-wider">ACT: {row.actuals[1]}</span>
                  </div>
                </td>

                {/* P3 */}
                <td className="py-4 pl-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(row.predictions[2], row.actuals[2], 2, row.actuals)}`}>
                      {row.predictions[2]}
                    </span>
                    <span className="text-[10px] text-gray-500 tracking-wider">ACT: {row.actuals[2]}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
