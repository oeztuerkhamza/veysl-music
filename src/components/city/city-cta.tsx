import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import type { City } from '@/content/cities';

export function CityCta({ city }: { city: City }) {
  const t = useTranslations('city');

  return (
    <Section id="anfrage">
      <Container>
        <Reveal>
          <div className="rounded-lg border border-line bg-surface px-6 py-12 sm:px-12">
            <SectionHeading
              align="center"
              eyebrow={t('cta.eyebrow')}
              title={t('cta.title', { city: city.name })}
              lead={t('cta.subtitle', { city: city.name })}
            />
            <div className="mt-8 flex justify-center">
              <Button href="/anfrage" variant="gold" size="lg">
                {t('cta.button', { city: city.name })}
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
