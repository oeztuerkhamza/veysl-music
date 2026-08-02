import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { SiteImage } from '@/components/media';
import { ShowreelFacade } from './showreel-facade';

export async function Showreel() {
  const t = await getTranslations('home.showreel');

  return (
    <Section id="showreel" className="bg-surface">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />

        <Reveal>
          <div className="mt-10">
            {/* TODO(kunde): pass a real `embedUrl` once the aftermovie exists — no refactor needed.
                Das Standbild kommt als Server-Kind herein, damit die Client-Fassade
                keine Bild-URL kennt und der Slot ganz normal über die Registry bzw.
                das Admin austauschbar bleibt. */}
            <ShowreelFacade playLabel={t('play')}>
              <SiteImage
                slot="home.showreel.poster"
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="absolute inset-0 rounded-none"
                decorative
              />
            </ShowreelFacade>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
