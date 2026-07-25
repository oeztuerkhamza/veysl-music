import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Section } from '@/components/ui/section';

// Renders as `{children}` inside the already-rendered `[locale]/layout.tsx`
// tree in the common case (a dead link within a valid locale) — so this must
// NOT render its own <html>/<body>, only the page content.
export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <Section className="flex min-h-[70dvh] items-center">
      <Container size="narrow" className="flex flex-col items-center gap-6 text-center">
        <Eyebrow>404</Eyebrow>
        <h1 className="text-display-2 font-display text-ink">{t('title')}</h1>
        <p className="max-w-md text-lg leading-relaxed text-ink-muted">{t('text')}</p>
        <Button href="/" variant="gold" size="lg">
          {t('cta')}
        </Button>
      </Container>
    </Section>
  );
}
