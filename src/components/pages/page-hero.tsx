import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/motion/reveal';
import { SiteImage, type SiteImageSlotKey } from '@/components/media';

interface PageHeroProps {
  /** Omitted on utility pages (impressum/datenschutz) that have no natural category label. */
  eyebrow?: string;
  /** Rendered as the page's single <h1> — callers must not render another one. */
  title: string;
  subtitle?: string;
  /** Optional extra content under the subtitle (e.g. a reach/service-area line). */
  children?: ReactNode;
  /**
   * Optional slot-driven accent image beside the heading — see
   * `src/content/site-images.ts`. Renders the designed empty state until a
   * real photo exists. Omitted by default: every existing caller keeps the
   * original single-column hero, byte-for-byte. Desktop-only (`lg:`) so the
   * mobile hero never carries an extra "photo coming soon" panel above the
   * fold.
   */
  imageSlot?: SiteImageSlotKey;
}

/** Shared h1 hero block for every inner page — keeps "exactly one <h1>" consistent. */
export function PageHero({ eyebrow, title, subtitle, children, imageSlot }: PageHeroProps) {
  return (
    <Section>
      <Container>
        <Reveal>
          <div className={cn(imageSlot && 'lg:grid lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12')}>
            <div className="max-w-3xl">
              {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
              <h1 className={cn('font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] text-ink', eyebrow && 'mt-4')}>
                {title}
              </h1>
              {subtitle ? <p className="mt-6 text-lg leading-relaxed text-ink-muted">{subtitle}</p> : null}
              {children}
            </div>
            {imageSlot ? (
              <div className="hidden lg:block">
                <SiteImage slot={imageSlot} sizes="(min-width: 1024px) 33vw, 100vw" priority />
              </div>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
