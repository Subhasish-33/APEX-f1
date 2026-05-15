import Link from "next/link";

const plannedFeeds = [
  "Official race weekend briefings",
  "Team technical updates",
  "Driver market reports",
  "FIA documents and race-control notes",
  "Source-attributed paddock news",
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24">
      <section className="relative min-h-[70vh] overflow-hidden border-b border-white/10">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          src="/videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.95),rgba(0,0,0,0.56))]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[70vh] flex items-end pb-16">
          <div className="max-w-4xl">
            <span className="block text-[10px] font-black uppercase tracking-[0.45em] text-[var(--color-f1-red)] mb-6">
              APEX Newsroom
            </span>
            <h1 className="text-6xl sm:text-8xl font-display font-black uppercase italic tracking-tighter leading-[0.85]">
              Source-Governed Coverage
            </h1>
            <p className="mt-8 max-w-2xl text-white/65 text-lg leading-relaxed">
              The news surface is reserved for licensed, attributed, and source-aware coverage. No scraped article body or unsourced rumor stream will ship here.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 border border-white/10 p-8 sm:p-10">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/35">
              Current State
            </span>
            <h2 className="mt-5 text-4xl sm:text-6xl font-display font-black uppercase italic tracking-tighter leading-none">
              News Ingestion Offline
            </h2>
            <p className="mt-6 text-white/55 leading-relaxed max-w-xl">
              This module will activate after the source registry, article envelope, dedupe logic, and rights-safe summary rules are implemented.
            </p>
            <Link href="/" className="inline-flex mt-8 bg-white text-black px-7 py-4 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-[var(--color-f1-red)] hover:text-white transition-ui">
              Return to Race Hub
            </Link>
          </div>

          <aside className="lg:col-span-5 bg-white text-black p-8 sm:p-10">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--color-f1-red)]">
              Feed Plan
            </span>
            <div className="mt-8 divide-y divide-black/10">
              {plannedFeeds.map((feed) => (
                <div key={feed} className="py-5 flex items-center justify-between gap-6">
                  <span className="font-black uppercase tracking-tight">{feed}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/35">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
