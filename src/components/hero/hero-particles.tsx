'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 260;

/**
 * Reads a design token straight off the live cascade instead of hardcoding a hex
 * value here — keeps the scene in sync with the token and honours theme changes.
 */
function useColorToken(token: string): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    setValue(resolved || null);
  }, [token]);

  return value;
}

function GoldDrift({ color }: { color: string }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 7;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    // Slow drift only — this is meant to feel like haze settling, not a particle storm.
    pointsRef.current.rotation.y = elapsed * 0.015;
    pointsRef.current.position.y = Math.sin(elapsed * 0.08) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color={color}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Slow, elegant gold-particle drift over near-black — a cheap stand-in for
 * volumetric haze. Dynamically imported with `ssr: false` and gated entirely by
 * `<HeroScene>` (reduced motion, low-power devices, first-paint deferral).
 */
export function HeroParticles() {
  const gold = useColorToken('--color-gold');
  const bg = useColorToken('--color-bg');

  if (!gold || !bg) return null;

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <fog attach="fog" args={[bg, 4, 9]} />
      <GoldDrift color={gold} />
    </Canvas>
  );
}
