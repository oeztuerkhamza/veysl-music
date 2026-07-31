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

/** Matches the previous GSAP `expo.out` closely enough that the motion is indistinguishable side by side. */
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DURATION_MS = 900;

/**
 * Fade/rise on scroll — reduced-motion safe, and now dependency-free.
 *
 * This used to run on GSAP + ScrollTrigger: **111 KB of JavaScript for a fade
 * and a 24-pixel rise**. It was GSAP's only use anywhere in the codebase, so
 * the whole library shipped on every page for this one effect.
 * `IntersectionObserver` (native in every target browser) plus a CSS
 * transition does the same job for nothing. The props are unchanged, so no
 * call site needed touching.
 *
 * The safety property of the GSAP version is preserved exactly: the hidden
 * state is only ever applied imperatively, from an effect, after the
 * `prefers-reduced-motion` check. There is no CSS class that hides content by
 * default — so if JS never runs, or motion is reduced, children are fully
 * visible from the very first paint.
 */
export function Reveal({ children, delay = 0, y = 24, as: Component = 'div', className, repeat = false }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // markup is already visible — nothing to animate, nothing to clean up

    /**
     * Content that is already on screen when the component mounts is never
     * hidden — it just stays as the server rendered it.
     *
     * This is what a scroll reveal is actually for: revealing things you
     * scroll *to*. Hiding what is already visible and fading it back in costs
     * something concrete and costs it on the most expensive element of the
     * page. The homepage `<h1>` sits inside a `<Reveal>` and is the LCP
     * element; while it is at `opacity: 0` the browser does not count it as
     * painted, so the previous behaviour pushed Largest Contentful Paint back
     * by the full delay plus the 900 ms fade — a second of pure metric loss on
     * text the server had already delivered.
     *
     * Below the fold nothing changes: those elements are not intersecting at
     * mount, get hidden as before, and animate in on scroll.
     */
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    const hide = () => {
      node.style.opacity = '0';
      node.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    const show = () => {
      node.style.opacity = '1';
      node.style.transform = 'translate3d(0, 0, 0)';
    };

    hide();
    node.style.transition = `opacity ${DURATION_MS}ms ${EASE} ${delay}s, transform ${DURATION_MS}ms ${EASE} ${delay}s`;
    // Compositor hint only while the element is waiting or animating; cleared
    // afterwards so a long page doesn't hold dozens of layers alive.
    node.style.willChange = 'opacity, transform';

    let clearHandle: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            if (!repeat) {
              observer.unobserve(node);
              clearHandle = window.setTimeout(() => {
                node.style.willChange = '';
              }, DURATION_MS + delay * 1000);
            }
          } else if (repeat) {
            hide();
          }
        }
      },
      // The equivalent of ScrollTrigger's `top 85%`: fire once the element has
      // risen past 85% of the viewport height, i.e. shortly after it appears.
      { rootMargin: '0px 0px -15% 0px', threshold: 0 },
    );

    observer.observe(node);

    /**
     * Sicherheitsnetz: Sollte die Beobachtung aus irgendeinem Grund nie
     * auslösen, wird der Inhalt trotzdem sichtbar.
     *
     * Der Effekt versteckt Inhalt imperativ und macht ihn erst per Callback
     * wieder sichtbar — bleibt der Callback aus, bleibt echter Text dauerhaft
     * unsichtbar. Das ist kein theoretischer Fall: In einer Umgebung ohne
     * laufende Renderpipeline (headless-Screenshot-Dienste, eingebettete
     * Vorschaufenster, die keine Frames zeichnen) feuert
     * `IntersectionObserver` nachweislich nicht. Nach 4 Sekunden ist ohnehin
     * jede Reveal-Animation, die noch etwas taugt, gelaufen — also lieber ohne
     * Animation sichtbar als animiert unsichtbar.
     */
    const failsafe = window.setTimeout(() => {
      if (node.style.opacity === '0') show();
    }, 4000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
      if (clearHandle !== undefined) window.clearTimeout(clearHandle);
      node.style.opacity = '';
      node.style.transform = '';
      node.style.transition = '';
      node.style.willChange = '';
    };
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
