import React from "react";
import EliteImage from "../media/EliteImage";
import { MediaDeliveryEnvelope } from "../media/EliteImageTypes";

interface MemorySurfaceProps {
  title: string;
  classification: "LEGENDARY" | "TRAGIC" | "DOMINANT" | "CHAOTIC" | "REDEMPTIVE";
  editorialText: string;
  heroEnvelope: MediaDeliveryEnvelope;
  echoContext?: string;
}

/**
 * MemorySurface
 * A cinematic, reflective wrapper for historical moments.
 * Uses warmer grading, heavy grain, and slow entry animations.
 * Telemetry density is purposefully reduced.
 */
export default function MemorySurface({
  title,
  classification,
  editorialText,
  heroEnvelope,
  echoContext
}: MemorySurfaceProps) {
  
  // Grading map based on classification taxonomy
  const getGradingClass = () => {
    switch(classification) {
      case "TRAGIC": return "grade-desaturated-blue";
      case "LEGENDARY": return "grade-warm-gold";
      case "CHAOTIC": return "grade-high-contrast";
      case "REDEMPTIVE": return "grade-sunrise";
      case "DOMINANT": return "grade-cold-steel";
      default: return "grade-neutral-cinematic";
    }
  };

  return (
    <article className={`memory-surface ${getGradingClass()}`}>
      {/* ── Cinematic Grain Overlay ── */}
      <div className="memory-grain-overlay" aria-hidden="true" />
      
      {/* ── Hero Imagery with Stills-Based Pacing ── */}
      <div className="memory-hero-container">
        <EliteImage 
          envelope={heroEnvelope}
          priority={true}
          className="memory-hero-image"
          context="legacy_surface"
        />
        <div className="memory-vignette" />
      </div>

      {/* ── Editorial Typography ── */}
      <div className="memory-editorial-content">
        <header>
          <span className="memory-classification">{classification}</span>
          <h1 className="memory-title">{title}</h1>
        </header>

        <p className="memory-prose">{editorialText}</p>
        
        {/* Temporal Echoes */}
        {echoContext && (
          <aside className="memory-echo">
            <span className="echo-label">TEMPORAL ECHO</span>
            <p>{echoContext}</p>
          </aside>
        )}
      </div>
    </article>
  );
}
