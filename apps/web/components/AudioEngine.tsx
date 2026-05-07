"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { useOrchestration } from "@/context/OrchestrationContext";

export function AudioEngine() {
  const { step, focusId, audioEnabled } = useOrchestration();
  
  // Audio Refs (Restrained, premium palette)
  const sounds = useRef<{
    transition?: Howl;
    focus?: Howl;
    hum?: Howl;
    blip?: Howl;
  }>({});

  useEffect(() => {
    // Initialize premium audio palette
    // Note: In production, these would point to high-fidelity .wav/.mp3 files
    sounds.current = {
      transition: new Howl({ src: ["/audio/ui_transition.mp3"], volume: 0.2 }),
      focus: new Howl({ src: ["/audio/ui_focus.mp3"], volume: 0.3 }),
      hum: new Howl({ src: ["/audio/garage_ambient.mp3"], volume: 0.05, loop: true }),
      blip: new Howl({ src: ["/audio/telemetry_blip.mp3"], volume: 0.1 }),
    };

    if (audioEnabled) {
      sounds.current.hum?.play();
    }

    return () => {
      Object.values(sounds.current).forEach(s => s?.unload());
    };
  }, []);

  useEffect(() => {
    if (!audioEnabled) {
      Howler.mute(true);
    } else {
      Howler.mute(false);
      sounds.current.hum?.play();
    }
  }, [audioEnabled]);

  // Orchestrate sound with temporal steps
  useEffect(() => {
    if (!audioEnabled) return;

    switch (step) {
      case "CAMERA_MOVING":
        sounds.current.transition?.play();
        break;
      case "SETTLE":
        sounds.current.blip?.play();
        break;
      case "REVEAL":
        sounds.current.focus?.play();
        break;
    }
  }, [step, audioEnabled]);

  return null; // Headless component
}
