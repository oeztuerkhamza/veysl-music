'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ParticleDriftCanvas = dynamic(() => import('./particle-drift-canvas').then((m) => m.ParticleDriftCanvas), {
  ssr: false,
});

/**
 * Gates the WebGL particle layer behind every perf/a11y check the contract
 * demands. Renders nothing whenever any check fails — the section underneath
 * must look finished with zero JS regardless.
 *
 * Belongs on dark ground only. The canvas draws with additive blending, which
 * adds light: over the ivory page it produces nothing visible at all, so on the
 * old light hero it was pure bundle and GPU cost. Mount it inside a
 * `<Section tone="night">`, where it reads as haze in a stage light.
 */
export function ParticleDrift() {
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
      <ParticleDriftCanvas />
    </div>
  );
}
