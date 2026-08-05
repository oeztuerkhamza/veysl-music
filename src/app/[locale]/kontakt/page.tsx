import { Mail, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { getSite } from '@/content/get-site';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { FinalCta } from '@/components/pages/final-cta';
import { ContactForm } from '@/components/contact/contact-form';
import { WhatsappCtaCard } from '@/components/whatsapp/whatsapp-cta-card';
// lucide-react ships no brand/logo icons — real inline-SVG brand marks live
// in the layout agent's src/components/ui/social-icons.tsx instead.
import { InstagramIcon, YouTubeIcon } from '@/components/ui/social-icons';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/kontakt' });
}

export default async function KontaktPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const tCta = await getTranslations('cta');
  const tContactForm = await getTranslations('contactForm');

  // CMS-editable contact info (Payload global `site-settings`), falling back
  // to the static defaults in src/content/site.ts — see src/content/get-site.ts.
  const site = await getSite();

  const areas = site.serviceAreas.join(', ');

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        imageSlot="kontakt.portrait"
      />

      <Section>
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            <Reveal>
              <WhatsappCtaCard
                source="contactPage"
                title={tCta('whatsapp')}
                text={t('whatsappText')}
                className="flex h-full w-full flex-col gap-3 rounded-lg border border-gold bg-surface-2 p-6 text-start transition-colors hover:bg-surface"
              />
            </Reveal>

            <Reveal>
              <a
                href={site.contact.phoneHref}
                className="flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-6 transition-colors hover:border-gold"
              >
                <Phone aria-hidden="true" className="h-6 w-6 text-gold" />
                <p className="font-display text-xl text-ink">{site.contact.phone}</p>
                <p className="text-sm text-ink-muted">{t('phoneText')}</p>
              </a>
            </Reveal>

            <Reveal>
              <a
                href={`mailto:${site.contact.email}`}
                className="flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-6 transition-colors hover:border-gold"
              >
                <Mail aria-hidden="true" className="h-6 w-6 text-gold" />
                <p className="break-all font-display text-xl text-ink">{site.contact.email}</p>
                <p className="text-sm text-ink-muted">{t('emailText')}</p>
              </a>
            </Reveal>
          </div>

          {/* Folgen-Links sitzen im selben Abschnitt wie die drei Kontaktkarten,
              nicht mehr in einem eigenen <Section>. Sie sind derselbe Gedanke —
              „so erreichen Sie uns" — und als eigener Abschnitt beanspruchten
              zwei Pillen die volle Abschnitts-Höhe von über 300 px, ohne
              Überschrift, direkt neben dem Block, zu dem sie gehören. */}
          <Reveal>
            <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{t('socialTitle')}</p>
              <div className="flex flex-wrap gap-3">
                {site.social.instagram ? (
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    {t('instagramCta')}
                  </a>
                ) : null}
                {site.social.youtube ? (
                  <a
                    href={site.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
                  >
                    <YouTubeIcon className="h-4 w-4" />
                    {t('youtubeCta')}
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <div className="rounded-lg border border-line bg-surface p-8 sm:p-10">
              <h2 className="font-display text-2xl text-ink">{t('areaTitle')}</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">{t('areaText', { areas })}</p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/*
        Hier stand ein eigener Abschnitt, der nichts enthielt als einen
        einzelnen Button nach /anfrage — über 300 px Höhe, ohne Überschrift,
        und inhaltlich dasselbe Ziel wie das <FinalCta compact /> am Seitenende,
        gut 900 px weiter unten. Zwei Aufrufe zur selben Handlung auf einer
        Seite schwächen beide; der am Ende hat wenigstens eine Überschrift und
        einen Kontext. Der Button ist deshalb ersatzlos entfallen, nicht
        verschoben.
      */}

      {/*
        General contact form — separate from the /anfrage booking funnel on
        purpose (see src/lib/contact.ts): for venues, planners, press, AV
        rental questions, or anyone with a question before they're ready to
        enquire about a date. WhatsApp above stays the loudest/fastest
        channel; this is for people who want to write something longer.
      */}
      <Section>
        <Container>
          <Reveal>
            <div className="mx-auto flex max-w-2xl flex-col gap-8">
              <SectionHeading eyebrow={t('formSectionEyebrow')} title={tContactForm('title')} lead={tContactForm('subtitle')} />
              <ContactForm />
            </div>
          </Reveal>
        </Container>
      </Section>

      <FinalCta compact />
    </>
  );
}
