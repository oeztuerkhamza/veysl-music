import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { ShowreelFacade } from './showreel-facade';

export async function Showreel() {
  const t = await getTranslations('home.showreel');

  return (
    <Section id="showreel" className="bg-surface">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />

        <Reveal>
          <div className="mt-10">
            {/* TODO(kunde): pass a real `embedUrl` once the aftermovie exists — no refactor needed. */}
            <ShowreelFacade playLabel={t('play')} />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
