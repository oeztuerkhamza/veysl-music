import { Briefcase, Check, Heart, PartyPopper, Users, type LucideIcon } from 'lucide-react';
import type { ServiceIconName } from '@/content/services';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { SiteImage, type SiteImageSlotKey } from '@/components/media';

const ICONS: Record<ServiceIconName, LucideIcon> = { Heart, Users, PartyPopper, Briefcase };

interface ServiceBlockProps {
  icon: ServiceIconName;
  title: string;
  tagline: string;
  text: string;
  features: string[];
  /** Alternates icon side + surface tint for visual rhythm across the four blocks. */
  reversed?: boolean;
  /**
   * Optional slot-driven photo (see `src/content/site-images.ts`) shown in
   * the leading column instead of the plain icon badge. The icon still
   * renders — just moved above the copy — so the block never loses its
   * category marker. Omitted: identical markup to before.
   */
  imageSlot?: SiteImageSlotKey;
}

export function ServiceBlock({ icon, title, tagline, text, features, reversed = false, imageSlot }: ServiceBlockProps) {
  const Icon = ICONS[icon];

  return (
    <Section>
      <Container>
        <Reveal>
          <div
            className={cn(
              'flex flex-col gap-6 rounded-lg border border-line p-8 sm:flex-row sm:items-start sm:p-10',
              reversed ? 'bg-surface-2 sm:flex-row-reverse' : 'bg-surface'
            )}
          >
            {imageSlot ? (
              <div className="w-full shrink-0 sm:w-56">
                <SiteImage slot={imageSlot} sizes="(min-width: 640px) 224px, 100vw" />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold"
              >
                <Icon className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0">
              {imageSlot ? (
                <div
                  aria-hidden="true"
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold"
                >
                  <Icon className="h-5 w-5" />
                </div>
              ) : null}
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{tagline}</p>
              <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">{title}</h3>
              <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">{text}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
