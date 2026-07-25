'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const HeroParticles = dynamic(() => import('./hero-particles').then((m) => m.HeroParticles), {
  ssr: false,
});

/**
 * Gates the WebGL particle layer behind every perf/a11y check the contract demands.
 * Renders nothing (falls back to the CSS gradient + optional aftermovie underneath)
 * whenever any check fails — the hero must look finished with zero JS regardless.
 */
export function HeroScene() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const lowCoreCount = (navigator.hardwareConcurrency ?? 8) <= 4;
    if (coarsePointer && lowCoreCount) return;

    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    // Defer past first paint so the canvas never competes with the LCP text.
    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
    } else {
      timeoutHandle = window.setTimeout(() => setReady(true), 200);
    }

    return () => {
      if (idleHandle !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <HeroParticles />
    </div>
  );
}
