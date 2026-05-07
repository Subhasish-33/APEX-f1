import { api } from "@/lib/api";
import { Suspense } from "react";
import PointsChart from "@/components/PointsChart";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const standings = await api.getSeasonStandings(2023);
  return standings.data.map((entry) => ({
    ref: entry.driver?.driver_ref,
  }));
}

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
    <div className="bg-f1-dark min-h-screen">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-b from-f1-red/20 to-f1-dark border-b border-white/5 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="flex-grow">
              <Link href="/drivers" className="inline-flex items-center gap-2 text-f1-red text-[10px] font-black uppercase tracking-widest mb-6 hover:text-white transition-colors">
                <svg className="w-3 h-3 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
                Back to Grid
              </Link>
              <h1 className="text-6xl sm:text-8xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
                {driver.forename} <span className="text-f1-red block sm:inline">{driver.surname}</span>
              </h1>
              <div className="flex flex-wrap gap-8 mt-8">
                <Stat label="Nationality" value={driver.nationality} />
                <Stat label="Number" value={driver.code || "N/A"} />
                <Stat label="Reference" value={driver.driver_ref} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Career Stats */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
              <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Career Overview</h3>
              <div className="space-y-6">
                <CareerRow label="Grand Prix Entries" value="250+" />
                <CareerRow label="Podiums" value="103" />
                <CareerRow label="Wins" value="103" />
                <CareerRow label="World Titles" value="7" />
                <CareerRow label="Pole Positions" value="104" />
              </div>
            </div>
            
            <div className="bg-f1-red p-8 rounded-sm">
              <p className="text-white font-black uppercase italic text-xl leading-tight">
                "Every day you wake up, you're chasing that fraction of a second."
              </p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
              <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4">Points History</h3>
              <p className="text-gray-400 text-sm mb-8">Seasonal points progression over the last decade.</p>
              <Suspense fallback={<div className="h-[300px] bg-white/5 animate-pulse" />}>
                <DriverCareerChart ref_id={ref} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">{label}</span>
      <span className="text-xl text-white font-black uppercase italic">{value}</span>
    </div>
  );
}

function CareerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 pb-4">
      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{label}</span>
      <span className="text-xl font-black text-white italic">{value}</span>
    </div>
  );
}

async function DriverCareerChart({ ref_id }: { ref_id: string }) {
  // Mock data for the chart based on the driver ref
  // In a real app, you'd fetch this from a historical stats endpoint
  const years = [2018, 2019, 2020, 2021, 2022, 2023];
  const data = years.map(y => ({
    year: y,
    points: Math.floor(Math.random() * 400) + 50
  }));

  return <PointsChart data={data} />;
}
