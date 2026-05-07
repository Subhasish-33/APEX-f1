import { getStandings, getRaces, DriverStanding, Race } from "@/lib/api";

export default async function Home() {
  const standings: DriverStanding[] = await getStandings();
  const races: Race[] = await getRaces(2024);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-6">
      
      <h1 className="text-4xl font-bold mb-8 text-red-500">
        🏎 Apex F1 Dashboard
      </h1>

      {/* Standings */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Driver Standings</h2>

        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {standings.map((d, i) => (
            <div
              key={i}
              className="flex justify-between px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition"
            >
              <span className="font-semibold">
                #{d.position} {d.name}
              </span>
              <span className="text-red-400 font-bold">
                {d.points} pts
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Races */}
      <section>
        <h2 className="text-2xl mb-4">2024 Race Calendar</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {races.map((r) => (
            <div
              key={r.race_id}
              className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition"
            >
              <div className="text-lg font-semibold">{r.name}</div>
              <div className="text-sm text-gray-400">{r.date}</div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}