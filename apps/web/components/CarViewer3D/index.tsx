"use client";

import React, { Suspense, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { 
  View,
  PerspectiveCamera, 
  Environment, 
  ContactShadows,
  CameraControls
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { CarModel } from "./CarModel";
import { Hotspots, HotspotData } from "./Hotspots";
import { SignatureExperience } from "./SignatureExperience";
import { ErrorBoundary } from "../ErrorBoundary";
import { useOrchestration } from "@/context/OrchestrationContext";
import * as THREE from "three";

interface CarViewer3DProps {
  modelPath: string;
  teamColor: string;
  hotspots?: HotspotData[];
  onHotspotClick?: (id: string) => void;
  className?: string;
}

export interface CarViewerHandle {
  focusOn: (position: [number, number, number]) => void;
  resetCamera: () => void;
}

export const CarViewer3D = forwardRef<CarViewerHandle, CarViewer3DProps>(({ 
  modelPath, 
  teamColor, 
  hotspots = [], 
  onHotspotClick = () => {},
  className = ""
}, ref) => {
  const { focusId, step } = useOrchestration();
  const [isHovered, setIsHovered] = useState(false);
  const controlsRef = useRef<CameraControls>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focusOn: (position) => {
      if (controlsRef.current) {
        const [x, y, z] = position;
        // Cinematic inertial zoom to part
        controlsRef.current.setLookAt(
          x + 1.2, y + 0.6, z + 1.2, // Camera position (Closer for detail)
          x, y, z,                  // Target
          true                      // Enable transition
        );
      }
    },
    resetCamera: () => {
      if (controlsRef.current) {
        controlsRef.current.setLookAt(5, 2, 5, 0, 0, 0, true);
      }
    }
  }));

  // Find active hotspot for dynamic lighting
  const activeHotspot = hotspots.find(h => h.id === focusId);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ErrorBoundary>
        <View className="absolute inset-0">
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={40} />
            
            <CameraControls 
              ref={controlsRef}
              makeDefault
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
              enableZoom={false}
              dollySpeed={0.2}
              truckSpeed={0.2}
              draggingDamping={0.1}
            />

            <ambientLight intensity={focusId ? 0.2 : 0.4} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={focusId ? 0.5 : 1} castShadow />
            
            {/* Dynamic Focal Point Light */}
            <AnimatePresence>
              {activeHotspot && (
                <group position={activeHotspot.position as [number, number, number]}>
                   <pointLight 
                     color={teamColor} 
                     intensity={step === "FOCUSED" ? 2 : 0.5} 
                     distance={3}
                     decay={2}
                   />
                </group>
              )}
            </AnimatePresence>

            {/* General Rim Light */}
            {!focusId && (
              <pointLight position={[0, 2, -4]} color={teamColor} intensity={1.2} />
            )}

            <group position={[0, -0.4, 0]}>
              <CarModel modelPath={modelPath} teamColor={teamColor} />
              
              <SignatureExperience 
                teamColor={teamColor} 
                active={step === "FOCUSED"} 
              />

              <Hotspots 
                hotspots={hotspots} 
                teamColor={teamColor} 
                onHotspotClick={onHotspotClick} 
                activeId={focusId}
              />
            </group>

            <ContactShadows 
              position={[0, -0.41, 0]} 
              opacity={0.6} 
              scale={10} 
              blur={2.5} 
              far={10} 
            />

            <Environment preset="studio" />

            <EffectComposer disableNormalPass>
              <Bloom 
                luminanceThreshold={0.9} 
                mipmapBlur 
                intensity={focusId ? 0.8 : 0.5} 
                radius={0.4} 
              />
            </EffectComposer>
          </Suspense>
        </View>
      </ErrorBoundary>

      {/* Brand Overlay */}
      <div className="absolute top-8 left-8 pointer-events-none select-none">
        <div className="flex items-center gap-3">
           <div className="w-1 h-8" style={{ backgroundColor: teamColor }} />
           <div>
             <span className="block text-[8px] text-white/40 font-bold uppercase tracking-[0.4em]">APEX-F1 Precision Visualizer</span>
             <span className="block text-lg text-white font-black italic uppercase tracking-tighter">Technical Chassis Analysis</span>
           </div>
        </div>
      </div>
    </div>
  );
});

CarViewer3D.displayName = "CarViewer3D";
