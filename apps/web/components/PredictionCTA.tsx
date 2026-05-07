import Link from "next/link";

export default function PredictionCTA() {
  return (
    <div className="relative group overflow-hidden rounded-sm bg-gradient-to-br from-indigo-900 to-f1-dark border border-white/10 p-10 h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 w-64 h-64 bg-f1-red/20 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-f1-red/30 transition-all duration-500" />
      
      <div className="relative z-10">
        <span className="inline-block bg-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-6 border border-white/10">
          AI-Powered Insights
        </span>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none italic">
          Who will take <span className="text-f1-red underline decoration-white/20 underline-offset-8">Pole Position?</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm font-medium">
          Our machine learning model analyzes thousands of telemetry data points to predict race outcomes with over 85% accuracy.
        </p>
        <Link 
          href="/predictions" 
          className="inline-flex items-center gap-3 bg-f1-red text-white px-8 py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all group-hover:translate-x-2"
        >
          View Predictions
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
