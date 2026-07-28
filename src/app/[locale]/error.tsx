'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Section } from '@/components/ui/section';

/**
 * Error boundary for everything under `[locale]`.
 *
 * There was none, so any uncaught render error — a CMS field coming back in an
 * unexpected shape, a provider throwing during a social-feed render — replaced
 * the whole page with Next.js's unstyled default error screen: black Helvetica
 * on white, in English, on a German wedding site. This keeps the visitor inside
 * the brand and, more importantly, inside reach of the contact routes: someone
 * who hit an error mid-enquiry is exactly the person worth not losing.
 *
 * Mirrors `not-found.tsx` next to it: renders only page content, because the
 * `[locale]/layout.tsx` tree (header, footer, fonts, `NextIntlClientProvider`)
 * is already mounted around it. That is also why `useTranslations` works here
 * at all — an error boundary at the root, outside the provider, could not
 * translate anything.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorPage');

  useEffect(() => {
    // The digest is the only handle on the server-side stack (the real message
    // is stripped in production on purpose). Logging it client-side is what
    // makes a user report — "it said something went wrong" — traceable to a
    // line in the server logs. Replace with a real reporter when one exists;
    // CHECKLIST.md A.3 has Sentry as an open item.
    console.error('[error-boundary]', error.digest ?? error.message);
  }, [error]);

  return (
    <Section className="flex min-h-[70dvh] items-center">
      <Container size="narrow" className="flex flex-col items-center gap-6 text-center">
        <Eyebrow>500</Eyebrow>
        <h1 className="text-display-2 font-display text-ink">{t('title')}</h1>
        <p className="max-w-md text-lg leading-relaxed text-ink-muted">{t('text')}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} variant="gold" size="lg">
            {t('retry')}
          </Button>
          <Button href="/" variant="secondary" size="lg">
            {t('home')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
