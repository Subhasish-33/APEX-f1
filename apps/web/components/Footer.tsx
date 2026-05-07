export default function Footer() {
  return (
    <footer className="bg-f1-dark border-t border-gray-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-f1-red font-black text-3xl tracking-tighter">
              APEX<span className="text-white">F1</span>
            </span>
            <p className="mt-4 text-gray-400 max-w-xs">
              The ultimate Formula 1 data analytics and prediction platform. 
              Real-time insights, historical archives, and AI-powered race simulations.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm">Platform</h3>
            <ul className="mt-4 space-y-2 text-gray-400 text-sm">
              <li>Drivers</li>
              <li>Teams</li>
              <li>Calendar</li>
              <li>Standings</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm">Data</h3>
            <ul className="mt-4 space-y-2 text-gray-400 text-sm">
              <li>Historical API</li>
              <li>Predictions</li>
              <li>Pit Telemetry</li>
              <li>Circuit Data</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-900 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} APEX F1 Analytics. All rights reserved.</p>
          <p className="mt-1 italic">This site is unofficial and is not associated in any way with the Formula 1 companies.</p>
        </div>
      </div>
    </footer>
  );
}
