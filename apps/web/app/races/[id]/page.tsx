"use client";

import { useState, useEffect, use } from "react";
import { api } from "../../../lib/api";
import { RaceDetail, Telemetry } from "@apex/types";
import { PodiumDisplay } from "../../../components/Race/PodiumDisplay";
import { ResultsTable } from "../../../components/Race/ResultsTable";
import { StrategyIntelligence } from "../../../components/Race/StrategyIntelligence";
import { QualifyingTable } from "../../../components/Race/QualifyingTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/UI/Tabs";
import { ChevronLeft, Activity } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RaceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const raceId = parseInt(id);

  const [race, setRace] = useState<RaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const raceData = await api.getRace(raceId);
        setRace(raceData);
      } catch (err) {
        console.error(err);
        setError("Failed to load race data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [raceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-[var(--color-f1-red)] animate-spin" />
          <span className="text-[10px] font-black tracking-[0.5em] text-[var(--color-text-muted)] uppercase">
            Loading Race Data...
          </span>
        </div>
      </div>
    );
  }

  if (error || !race) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-danger)] font-black mb-4">{error || "Race not found."}</p>
          <Link href="/calendar" className="text-[var(--color-text-secondary)] hover:text-white transition-ui text-sm">
            ← Back to Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation */}
        <div className="mb-10">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-ui group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-ui" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Back to Calendar</span>
          </Link>
        </div>

        {/* Race Header */}
        <header className="mb-16 border-b border-white/5 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-black text-[var(--color-f1-red)] uppercase tracking-[0.4em] block mb-3">
                Round {race.round} · {race.year}
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-black uppercase italic tracking-tighter text-[var(--color-text-primary)] leading-none">
                {race.name}
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-3 font-medium">
                {race.circuit?.name} · {race.circuit?.country}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-bg-secondary)] border border-white/5 p-4 rounded-sm">
                <span className="block text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-widest mb-1">Total Laps</span>
                <span className="text-2xl font-black font-data text-[var(--color-text-primary)]">{race.laps ?? "—"}</span>
              </div>
              <div className="bg-[var(--color-bg-secondary)] border border-white/5 p-4 rounded-sm">
                <span className="block text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-widest mb-1">Finishers</span>
                <span className="text-2xl font-black font-data text-[var(--color-text-primary)]">{race.results?.length ?? "—"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Podium */}
        <section className="mb-16">
          <PodiumDisplay results={race.results} />
        </section>

        {/* Strategy */}
        {race.pit_stops && race.results && (
          <section className="mb-16">
            <StrategyIntelligence
              pitStops={race.pit_stops}
              results={race.results}
              totalLaps={race.laps || 70}
            />
          </section>
        )}

        {/* Detailed Data Tabs */}
        <section className="bg-[var(--color-bg-secondary)] border border-white/5 rounded-sm p-8">
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="mb-8 flex gap-1">
              <TabsTrigger value="results" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest">
                Results
              </TabsTrigger>
              <TabsTrigger value="qualifying" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest">
                Qualifying
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <ResultsTable results={race.results} />
            </TabsContent>

            <TabsContent value="qualifying">
              <QualifyingTable qualifying={race.qualifying} />
            </TabsContent>
          </Tabs>
        </section>

      </div>
    </main>
  );
}
