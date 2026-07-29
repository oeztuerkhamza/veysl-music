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

    // Touch devices never load this — and that is the whole point of the
    // check, not a fallback for weak ones.
    //
    // The gate used to be `coarsePointer && lowCoreCount`, which in practice
    // excluded almost nothing: a current phone reports eight cores, so it
    // passed the AND and pulled three.js down anyway. That is ~864 KB
    // unminified (~250 KB over the wire) plus WebGL setup and a render loop,
    // on the device class where the budget is tightest, for a decorative haze
    // behind one section — the single largest download on the site, spent on
    // something nobody would report missing.
    //
    // Desktop keeps it: there the bytes are cheap, the section has room to
    // breathe, and the effect is the one it was designed for.
    if (window.matchMedia('(pointer: coarse)').matches) return;

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
