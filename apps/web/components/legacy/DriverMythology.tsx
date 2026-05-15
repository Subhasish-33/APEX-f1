import React from "react";
import MemorySurface from "./MemorySurface";

interface DriverMythologyProps {
  driverRef: string;
  archetype: string; // e.g., "THE UNFINISHED DESTINY", "THE INEVITABLE"
  careerMoments: Array<any>;
}

/**
 * DriverMythology
 * Evolves the standard driver profile page into a career narrative.
 * It does not just show "Wins: 14", it tells the story of how they were won.
 */
export default function DriverMythology({
  driverRef,
  archetype,
  careerMoments
}: DriverMythologyProps) {
  
  return (
    <section className="driver-mythology-system">
      
      {/* Editorial Title Block */}
      <header className="mythology-header">
        <h2 className="driver-name">{driverRef.replace("-", " ").toUpperCase()}</h2>
        <h3 className="driver-archetype">{archetype}</h3>
      </header>

      {/* Narrative Sequence */}
      <div className="mythology-timeline">
        {careerMoments.map((moment) => (
          <div key={moment.id} className="mythology-epoch">
            {/* Minimalist marker */}
            <div className="epoch-marker" />
            
            <div className="epoch-content">
              <h4 className="epoch-title">{moment.title}</h4>
              <p className="epoch-editorial">{moment.editorial}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
