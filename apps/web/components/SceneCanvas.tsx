"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Precompute, View } from "@react-three/drei";

/**
 * Singleton Canvas component that hosts the single WebGL context.
 * All 3D views across the app will be "tunneled" into this canvas.
 */
export function SceneCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ 
        antialias: true, 
        alpha: true, 
        stencil: false, 
        depth: true,
        powerPreference: "high-performance" 
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 40, // Above main content, below navigation
      }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
    >
      <View.Port />
      <Precompute />
    </Canvas>
  );
}
