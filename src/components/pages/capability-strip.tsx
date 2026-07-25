import {
  Drum,
  Guitar,
  Heart,
  Mic,
  Music4,
  PartyPopper,
  Speaker,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { site } from '@/content/site';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';

/** Keys mirror site.capabilities (src/content/site.ts) exactly. */
const ICONS: Record<(typeof site.capabilities)[number], LucideIcon> = {
  'wedding-dj': Heart,
  'event-dj': PartyPopper,
  host: Mic,
  'live-music': Guitar,
  orchestra: Music4,
  'traditional-turkish': Drum,
  'av-rental': Speaker,
};

/**
 * "Beyond DJing" strip — DJ + musician + host + AV rental in one person.
 * Self-contained: reads site.capabilities directly and resolves its own
 * copy from messages "services.capabilitiesStrip", so the page just renders
 * `<CapabilityStrip />`.
 */
export async function CapabilityStrip() {
  const t = await getTranslations('services.capabilitiesStrip');

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.capabilities.map((id) => {
            const Icon = ICONS[id];
            return (
              <Reveal key={id}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-6">
                  <div
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-display text-lg text-ink">{t(`items.${id}.label`)}</p>
                  <p className="text-sm leading-relaxed text-ink-muted">{t(`items.${id}.text`)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
