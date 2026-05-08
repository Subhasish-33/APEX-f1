"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type OrchestrationStep = "IDLE" | "CAMERA_MOVING" | "SETTLE" | "REVEAL" | "FOCUSED" | "SUSPENSE" | "ERROR" | "RESOLVE";

interface OrchestrationContextType {
  focusId: string | null;
  step: OrchestrationStep;
  audioEnabled: boolean;
  reducedMotion: boolean;
  setFocus: (id: string | null) => void;
  setStep: (step: OrchestrationStep) => void;
  toggleAudio: () => void;
  toggleMotion: () => void;
  triggerSuspense: () => void;
  triggerError: () => void;
  triggerResolve: () => void;
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
  
  const triggerSuspense = useCallback(() => setStep("SUSPENSE"), []);
  const triggerError = useCallback(() => setStep("ERROR"), []);
  const triggerResolve = useCallback(() => setStep("RESOLVE"), []);

  return (
    <OrchestrationContext.Provider value={{ 
      focusId, 
      step, 
      audioEnabled, 
      reducedMotion,
      setFocus, 
      setStep,
      toggleAudio,
      toggleMotion,
      triggerSuspense,
      triggerError,
      triggerResolve
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
