import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-primary)] border-t border-white/5 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <span className="text-[var(--color-f1-red)] font-display font-black text-4xl tracking-tighter italic">
              APEX<span className="text-[var(--color-text-primary)]">F1</span>
            </span>
            <p className="text-[var(--color-text-secondary)] max-w-sm text-sm leading-relaxed">
              The production-grade Formula 1 data foundation. 
              Real-time analytics, historical archives, and performance intelligence for the modern era.
            </p>
          </div>
          <div>
            <h3 className="text-[var(--color-text-primary)] font-black uppercase tracking-widest text-xs mb-6 italic">Platform</h3>
            <ul className="space-y-3 text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-wider">
              <li><Link href="/drivers" className="hover:text-[var(--color-f1-red)] transition-ui">Drivers</Link></li>
              <li><Link href="/teams" className="hover:text-[var(--color-f1-red)] transition-ui">Teams</Link></li>
              <li><Link href="/calendar" className="hover:text-[var(--color-f1-red)] transition-ui">Calendar</Link></li>
              <li><Link href="/standings" className="hover:text-[var(--color-f1-red)] transition-ui">Standings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[var(--color-text-primary)] font-black uppercase tracking-widest text-xs mb-6 italic">Data Core</h3>
            <ul className="space-y-3 text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-wider">
              <li><Link href="/news" className="hover:text-[var(--color-f1-red)] transition-ui">Newsroom</Link></li>
              <li><Link href="/predictions" className="hover:text-[var(--color-f1-red)] transition-ui">Predictions</Link></li>
              <li><Link href="/live" className="hover:text-[var(--color-f1-red)] transition-ui">Live Telemetry</Link></li>
              <li><Link href="/calendar" className="hover:text-[var(--color-f1-red)] transition-ui">Circuit DNA</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 text-center text-[var(--color-text-muted)] text-[8px] font-bold uppercase tracking-[0.2em]">
          <p>&copy; {new Date().getFullYear()} APEX F1 FOUNDATION. ALL RIGHTS RESERVED.</p>
          <p className="mt-2 italic opacity-50">THIS SITE IS UNOFFICIAL AND IS NOT ASSOCIATED IN ANY WAY WITH THE FORMULA 1 COMPANIES.</p>
        </div>
      </div>
    </footer>
  );
}
