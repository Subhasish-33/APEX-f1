import React, { useEffect, useRef } from "react";

interface IconicRadioArtifactProps {
  transcript: string;
  driverName: string;
  engineerName?: string;
  classification: string;
  year: number;
}

/**
 * IconicRadioArtifact
 * Treats radio transmissions like sacred artifacts.
 * No social media engagement bait. Complete stillness.
 * Typography fades in deliberately to emphasize weight and timing.
 */
export default function IconicRadioArtifact({
  transcript,
  driverName,
  engineerName,
  classification,
  year
}: IconicRadioArtifactProps) {
  
  const artifactRef = useRef<HTMLDivElement>(null);

  // In a real implementation, this triggers an IntersectionObserver
  // to sequence the fade-in of the text, syncing with the audio playback.
  useEffect(() => {
    if (artifactRef.current) {
      artifactRef.current.classList.add("radio-artifact-entered");
    }
  }, []);

  return (
    <section className="iconic-radio-artifact" ref={artifactRef}>
      <div className="radio-silence-container">
        
        <header className="radio-metadata">
          <span className="radio-year">{year}</span>
          <span className="radio-classification">{classification}</span>
        </header>

        <blockquote className="radio-transcript">
          {/* Format: "Engineer: ..." or just the driver quote */}
          <div className="radio-quote">
            <p>&quot;{transcript}&quot;</p>
          </div>
          <footer className="radio-speaker">— {driverName}</footer>
        </blockquote>

        {/* Minimalist waveform visualizer - analog style, no neon */}
        <div className="radio-analog-waveform" aria-hidden="true">
          <div className="waveform-line" />
        </div>

      </div>
    </section>
  );
}
