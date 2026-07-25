import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MessageCircle, Phone, Mail } from 'lucide-react';
import { routing, type Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { getSite } from '@/content/get-site';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { EnquiryForm } from '@/components/booking/enquiry-form';

interface BookingPageProps {
  params: Promise<{ locale: Locale }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/anfrage' });
}

// NOTE for the layout agent (already handled, just documenting the contract):
// this page is the destination of the funnel, so `StickyCtaBar` must stay
// hidden here — `src/components/layout/sticky-cta-bar.tsx` already checks
// `pathname === '/anfrage'` and suppresses itself accordingly.
export default async function BookingPage({ params }: BookingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('booking');
  const tCta = await getTranslations('cta');

  // CMS-editable contact info, falling back to src/content/site.ts — see get-site.ts.
  const site = await getSite();

  const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;

  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="flex flex-col gap-10">
            <Reveal>
              <SectionHeading as="h1" eyebrow={t('hero.eyebrow')} title={t('hero.title')} lead={t('hero.subtitle')} />
            </Reveal>

            <EnquiryForm />
          </div>

          <Reveal delay={0.1} as="aside">
            <Card className="flex h-fit flex-col gap-5">
              <h2 className="font-display text-2xl text-ink">{t('aside.title')}</h2>
              <p className="text-ink-muted">{t('aside.text')}</p>

              <div className="flex flex-col gap-3 text-sm">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gold hover:text-gold-soft"
                >
                  <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                  {tCta('whatsapp')}
                </a>
                <a href={site.contact.phoneHref} className="flex items-center gap-2 text-gold hover:text-gold-soft">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  {site.contact.phone}
                </a>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="flex items-center gap-2 text-gold hover:text-gold-soft"
                >
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {site.contact.email}
                </a>
              </div>

              <p className="text-xs text-ink-faint">{t('aside.responseTime')}</p>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
