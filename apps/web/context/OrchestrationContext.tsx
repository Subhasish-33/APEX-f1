"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type OrchestrationStep = "IDLE" | "CAMERA_MOVING" | "SETTLE" | "REVEAL" | "FOCUSED";

interface OrchestrationContextType {
  focusId: string | null;
  step: OrchestrationStep;
  audioEnabled: boolean;
  reducedMotion: boolean;
  setFocus: (id: string | null) => void;
  toggleAudio: () => void;
  toggleMotion: () => void;
}

const OrchestrationContext = createContext<OrchestrationContextType | undefined>(undefined);

export function OrchestrationProvider({ children }: { children: React.ReactNode }) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const [step, setStep] = useState<OrchestrationStep>("IDLE");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const setFocus = useCallback((id: string | null) => {
    if (id === focusId) return;
    
    setFocusId(id);
    
    if (id) {
      // Start the temporal storytelling sequence
      setStep("CAMERA_MOVING");
      
      // Sequencing timing (Orchestrated)
      setTimeout(() => setStep("SETTLE"), 800);
      setTimeout(() => setStep("REVEAL"), 1200);
      setTimeout(() => setStep("FOCUSED"), 2000);
    } else {
      setStep("IDLE");
    }
  }, [focusId]);

  const toggleAudio = () => setAudioEnabled(prev => !prev);
  const toggleMotion = () => setReducedMotion(prev => !prev);

  return (
    <OrchestrationContext.Provider value={{ 
      focusId, 
      step, 
      audioEnabled, 
      reducedMotion,
      setFocus, 
      toggleAudio,
      toggleMotion 
    }}>
      {children}
    </OrchestrationContext.Provider>
  );
}

export const useOrchestration = () => {
  const context = useContext(OrchestrationContext);
  if (!context) {
    throw new Error("useOrchestration must be used within an OrchestrationProvider");
  }
  return context;
}
