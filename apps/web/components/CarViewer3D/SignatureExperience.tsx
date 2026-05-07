"use client";

import React, { useMemo } from "react";
import { Line, Float } from "@react-three/drei";
import * as THREE from "three";

interface AeroFlowProps {
  count?: number;
  color: string;
}

function AeroFlowLines({ count = 20, color }: AeroFlowProps) {
  const lines = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const points = [];
      const z = (Math.random() - 0.5) * 2;
      const yOffset = (Math.random() - 0.5) * 0.5;
      
      for (let x = 3; x > -3; x -= 0.2) {
        // Simple aero curve logic
        const y = Math.sin(x * 0.5) * 0.2 + yOffset + (x > 0 ? 0.2 : -0.1);
        points.push(new THREE.Vector3(x, y, z));
      }
      return points;
    });
  }, [count]);

  return (
    <group>
      {lines.map((points, i) => (
        <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <Line
            points={points}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.3}
            dashed
            dashScale={5}
            dashSize={0.5}
            dashOffset={i * 0.1}
          />
        </Float>
      ))}
    </group>
  );
}

export function SignatureExperience({ teamColor, active }: { teamColor: string, active: boolean }) {
  if (!active) return null;

  return (
    <group>
      <AeroFlowLines color={teamColor} />
      
      {/* Cinematic Highlight Lights */}
      <pointLight position={[2, 1, 1]} color="white" intensity={2} />
      <pointLight position={[-2, 1, -1]} color={teamColor} intensity={2} />
      
      {/* 2026 Regulation Contextual Elements could go here */}
    </group>
  );
}
