'use client';

import { useEffect, useRef } from 'react';
import { useAudio } from './audio-provider';

/**
 * Subtle gold pulse behind the player, driven by the currently playing
 * track's frequency data. Pure flourish: skipped entirely under
 * prefers-reduced-motion or on low-core devices, and the Web Audio graph is
 * only touched (via getAnalyser()) while a track is actually playing — never
 * the reason a frame drops for anyone who has it disabled or can't afford it.
 */
export function AudioReactive({ className }: { className?: string }) {
  const { isPlaying, getAnalyser } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !isPlaying) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowCore =
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency > 0 &&
      navigator.hardwareConcurrency <= 2;
    if (reduceMotion || lowCore) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const analyser = getAnalyser();
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const gold = getComputedStyle(document.documentElement).getPropertyValue('--color-gold').trim() || '#D6B36A';
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const intensity = Math.min(1, sum / data.length / 160);

      ctx2d.clearRect(0, 0, width, height);
      const radius = (Math.min(width, height) / 2) * (0.5 + intensity * 0.5);
      const gradient = ctx2d.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius);
      gradient.addColorStop(0, gold);
      gradient.addColorStop(1, 'transparent');
      ctx2d.globalAlpha = 0.25 + intensity * 0.35;
      ctx2d.fillStyle = gradient;
      ctx2d.beginPath();
      ctx2d.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx2d.fill();

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying, getAnalyser]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      width={160}
      height={160}
      className={className}
    />
  );
}
