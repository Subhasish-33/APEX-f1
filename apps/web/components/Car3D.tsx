"use client";

import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Html, useGLTF } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

function F1Car({ teamColor }: { teamColor: string }) {
  const meshRef = useRef<any>();
  
  // Simple representation of an F1 car using primitives for now
  // In production, we would use: const { scene } = useGLTF('/models/f1_car.gltf')
  
  return (
    <group ref={meshRef}>
      {/* Main Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4, 0.5, 1.5]} />
        <meshStandardMaterial color={teamColor} />
      </mesh>
      
      {/* Front Wing */}
      <mesh position={[2.1, -0.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.1, 1.8]} />
        <meshStandardMaterial color={teamColor} />
      </mesh>
      
      {/* Rear Wing */}
      <mesh position={[-1.8, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.1, 1.4]} />
        <meshStandardMaterial color={teamColor} />
      </mesh>

      {/* Wheels */}
      {[[-1.2, -0.2, 0.8], [-1.2, -0.2, -0.8], [1.5, -0.2, 0.7], [1.5, -0.2, -0.7]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}

      {/* Hotspots */}
      <Hotspot position={[0, 0.4, 0]} title="Chassis" description="Carbon-fiber composite monocoque." />
      <Hotspot position={[1.5, -0.2, 0.9]} title="Tires" description="Pirelli P-Zero Compounds." />
      <Hotspot position={[-1.8, 0.6, 0]} title="Aero" description="High-downforce rear wing setup." />
    </group>
  );
}

function Hotspot({ position, title, description }: { position: [number, number, number], title: string, description: string }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Html position={position}>
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="w-4 h-4 bg-f1-red rounded-full border-2 border-white animate-pulse" />
        
        <AnimatePresence>
          {hovered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-sm z-50 pointer-events-none"
            >
              <h4 className="text-f1-red text-[10px] font-black uppercase tracking-widest mb-1">{title}</h4>
              <p className="text-white text-[10px] leading-tight">{description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
}

export default function Car3D({ teamColor = "#E10600" }: { teamColor?: string }) {
  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-transparent to-white/5 rounded-sm border border-white/5 overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={40} />
        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.1} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
        <pointLight position={[-10, -10, -10]} />
        
        <Suspense fallback={null}>
          <F1Car teamColor={teamColor} />
          <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </Suspense>
      </Canvas>
      
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Interactive 3D Model</span>
      </div>
    </div>
  );
}
