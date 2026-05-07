"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useGLTF, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CarModelProps {
  modelPath: string;
  teamColor: string;
}

function ProceduralCar({ teamColor }: { teamColor: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle float animation for the procedural model
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 - 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Main Chassis */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[4.2, 0.4, 1.2]} />
          <meshStandardMaterial color={teamColor} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Cockpit */}
        <mesh position={[0.2, 0.5, 0]} castShadow>
          <boxGeometry args={[0.8, 0.3, 0.6]} />
          <meshStandardMaterial color="#050505" metalness={1} roughness={0.1} />
        </mesh>

        {/* Front Wing */}
        <mesh position={[2.1, 0.1, 0]} castShadow>
          <boxGeometry args={[0.6, 0.05, 1.8]} />
          <meshStandardMaterial color={teamColor} metalness={0.5} />
        </mesh>
        
        {/* Rear Wing */}
        <mesh position={[-1.8, 0.7, 0]} castShadow>
          <boxGeometry args={[0.5, 0.05, 1.4]} />
          <meshStandardMaterial color={teamColor} metalness={0.5} />
        </mesh>

        {/* Wheels with motion blur feel */}
        {[
          [1.5, 0.3, 0.8],
          [1.5, 0.3, -0.8],
          [-1.2, 0.3, 0.8],
          [-1.2, 0.3, -0.8],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.4, 32]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

import { useRef } from "react";

function GLBModel({ modelPath, teamColor }: CarModelProps) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const [targetScale, setTargetScale] = useState(0);

  useEffect(() => {
    // Cinematic entrance: animate scale from 0 to 1
    setTargetScale(1);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      <primitive object={scene} castShadow receiveShadow />
    </group>
  );
}

export function CarModel({ modelPath, teamColor }: CarModelProps) {
  return (
    <Suspense fallback={<ProceduralCar teamColor={teamColor} />}>
      <GLBModel modelPath={modelPath} teamColor={teamColor} />
    </Suspense>
  );
}

// Preload generic model to avoid layout shifts
try {
  useGLTF.preload("/models/generic_f1.glb");
} catch (e) {
  console.warn("Generic model failed to preload, falling back to procedural.");
}
