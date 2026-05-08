"use client";

import React, { Suspense, useEffect, useState, useRef, Component, ReactNode } from "react";
import { useGLTF, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CarModelProps {
  modelPath: string;
  teamColor: string;
}

// Simple Error Boundary for Three.js Components
class ModelErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * HIGH-FIDELITY PROCEDURAL F1 CAR (Signature Fallback)
 * This replaces the basic 'boxes' with a detailed technical silhouette
 * of a modern ground-effect F1 car, including Halo, bargeboards, and 
 * multi-element wings.
 */
function ProceduralCar({ teamColor }: { teamColor: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.03 - 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* UNDERBODY / CHASSIS FLOOR */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[4.5, 0.1, 1.4]} />
          <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* MAIN BODY (COKE BOTTLE SHAPE) */}
        <mesh position={[0.2, 0.25, 0]} castShadow>
          <boxGeometry args={[3.2, 0.4, 0.9]} />
          <meshStandardMaterial color={teamColor} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* NOSE CONE */}
        <mesh position={[2.2, 0.15, 0]} castShadow>
          <boxGeometry args={[1.2, 0.2, 0.4]} />
          <meshStandardMaterial color={teamColor} metalness={0.8} />
        </mesh>

        {/* FRONT WING (2024 SPEC) */}
        <group position={[2.6, 0.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.05, 1.9]} />
            <meshStandardMaterial color={teamColor} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.15, 0.9]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.05]} />
            <meshStandardMaterial color={teamColor} />
          </mesh>
          <mesh position={[0, 0.15, -0.9]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.05]} />
            <meshStandardMaterial color={teamColor} />
          </mesh>
        </group>
        
        {/* REAR WING (DRS SPEC) */}
        <group position={[-2.1, 0.6, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.05, 1.4]} />
            <meshStandardMaterial color={teamColor} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.3, 0.65]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.05]} />
            <meshStandardMaterial color={teamColor} />
          </mesh>
          <mesh position={[0, -0.3, -0.65]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.05]} />
            <meshStandardMaterial color={teamColor} />
          </mesh>
        </group>

        {/* HALO & COCKPIT PROTECTION */}
        <mesh position={[0.4, 0.55, 0]} castShadow>
           <torusGeometry args={[0.35, 0.05, 16, 32, Math.PI]} rotation={[Math.PI / 2, 0, 0]} />
           <meshStandardMaterial color="#111" metalness={0.9} />
        </mesh>

        {/* AIR INTAKE / ROLL HOOP */}
        <mesh position={[-0.2, 0.65, 0]} castShadow>
           <boxGeometry args={[0.4, 0.3, 0.3]} />
           <meshStandardMaterial color={teamColor} />
        </mesh>

        {/* WHEELS (PIRELLI SLICKS) */}
        {[
          [1.6, 0.35, 0.85],   // Front Right
          [1.6, 0.35, -0.85],  // Front Left
          [-1.5, 0.4, 0.9],    // Rear Right
          [-1.5, 0.4, -0.9],   // Rear Left
        ].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[pos[0] > 0 ? 0.35 : 0.4, pos[0] > 0 ? 0.35 : 0.4, 0.45, 32]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
            </mesh>
            {/* Tyre detail line */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[pos[0] > 0 ? 0.36 : 0.41, 0.01, 8, 32]} />
              <meshStandardMaterial color={teamColor} emissive={teamColor} emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}
      </Float>
    </group>
  );
}

function GLBModel({ modelPath, teamColor }: CarModelProps) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const [targetScale, setTargetScale] = useState(0);

  useEffect(() => {
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
    <ModelErrorBoundary fallback={<ProceduralCar teamColor={teamColor} />}>
      <Suspense fallback={<ProceduralCar teamColor={teamColor} />}>
        <GLBModel modelPath={modelPath} teamColor={teamColor} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
