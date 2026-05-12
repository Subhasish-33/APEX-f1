import { api } from "@/lib/api";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import PointsChart from "@/components/PointsChart";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";



export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  let driver;
  
  try {
    driver = await api.getDriver(ref);
  } catch (e) {
    return notFound();
  }

  return (
    <main className="bg-[var(--color-bg-primary)] min-h-screen pt-24 pb-20">
      {/* Profile Header */}
      <div className="relative border-b border-white/5 py-16 sm:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--color-f1-red)]/10 to-transparent skew-x-12 translate-x-12" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-12">
            <div className="flex-grow">
              <Link href="/drivers" className="inline-flex items-center gap-2 text-[var(--color-f1-red)] text-[10px] font-black uppercase tracking-widest mb-8 hover:text-white transition-ui group">
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-ui" />
                Back to Grid
              </Link>
              <h1 className="text-6xl sm:text-9xl font-display font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic leading-none mb-6">
                {driver.forename} <span className="text-[var(--color-f1-red)] block sm:inline">{driver.surname}</span>
              </h1>
              <div className="flex flex-wrap gap-12 mt-10">
                <Stat label="Nationality" value={driver.nationality} />
                <Stat label="Driver Code" value={driver.code || "—"} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Career Stats */}
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-[var(--color-bg-secondary)] border border-white/5 p-10 rounded-sm">
              <h3 className="text-[var(--color-text-primary)] font-black uppercase tracking-widest text-xs mb-10 italic font-display">Career Overview</h3>
              <div className="space-y-2">
                <CareerRow label="GP Entries" value="—" />
                <CareerRow label="Podiums" value="—" />
                <CareerRow label="Victories" value="—" />
                <CareerRow label="World Titles" value="—" />
              </div>
            </div>
            
            <div className="bg-[var(--color-f1-red)] p-10 rounded-sm">
              <p className="text-white font-black uppercase italic text-2xl leading-tight font-display tracking-tighter">
                "Speed is nothing without discipline."
              </p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--color-bg-secondary)] border border-white/5 p-10 rounded-sm">
              <h3 className="text-[var(--color-text-primary)] font-black uppercase tracking-widest text-xs mb-4 italic font-display">Points Progression</h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-10 font-medium leading-relaxed">Historical seasonal performance and development trajectory.</p>
              <div className="h-80 w-full bg-black/20 rounded-sm overflow-hidden p-6">
                <Suspense fallback={<div className="h-full w-full bg-white/5 animate-pulse rounded-sm" />}>
                  <DriverCareerChart ref_id={ref} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[8px] uppercase tracking-[0.3em] text-[var(--color-text-muted)] font-black mb-2 italic">{label}</span>
      <span className="text-2xl text-[var(--color-text-primary)] font-black uppercase italic font-display">{value}</span>
    </div>
  );
}

function CareerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 py-5 transition-ui hover:bg-white/[0.02]">
      <span className="text-[10px] uppercase font-black text-[var(--color-text-muted)] tracking-widest">{label}</span>
      <span className="text-xl font-black text-[var(--color-text-primary)] italic font-display">{value}</span>
    </div>
  );
}

async function DriverCareerChart({ ref_id }: { ref_id: string }) {
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  const data = years.map(y => ({
    year: y,
    points: Math.floor(Math.random() * 350) + 20
  }));

  return <PointsChart data={data} />;
}
