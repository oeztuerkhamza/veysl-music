'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// useLayoutEffect warns during SSR; alias to useEffect there. This component
// is a client component anyway, so the alias only matters for the render
// pass on first mount.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface RevealProps {
  children: ReactNode;
  /** Seconds to delay the reveal after it enters the viewport. */
  delay?: number;
  /** Vertical travel distance in pixels for the rise. */
  y?: number;
  as?: ElementType;
  className?: string;
  /** Replay every time the element re-enters the viewport (default: once). */
  repeat?: boolean;
}

/**
 * GSAP + ScrollTrigger fade/rise, reduced-motion safe.
 *
 * The hidden state is only ever applied imperatively via `gsap.set`, inside
 * an effect, after checking `prefers-reduced-motion`. There is no CSS class
 * that hides the content by default — so if JS never runs (or motion is
 * reduced), children render fully visible from the very first paint.
 */
export function Reveal({ children, delay = 0, y = 24, as: Component = 'div', className, repeat = false }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // markup is already visible — nothing to animate, nothing to clean up

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(node, { autoAlpha: 0, y });
      gsap.to(node, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: node,
          start: 'top 85%',
          toggleActions: repeat ? 'play none none reverse' : 'play none none none',
        },
      });
    }, node);

    return () => ctx.revert();
  }, [delay, y, repeat]);

  // `Component` is typed as the broad `ElementType`, which makes JSX prop
  // resolution collapse to `never` for a polymorphic `as` tag. Narrowing the
  // tag to the shape it's actually rendered with (ref/className/children)
  // keeps the cast honest without reaching for `any`.
  const Tag = Component as ComponentType<{
    ref?: Ref<HTMLElement>;
    className?: string;
    children?: ReactNode;
  }>;

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
