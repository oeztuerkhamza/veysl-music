/**
 * ⚠️ This is a DRAFT privacy policy. It must be reviewed by a lawyer before
 * launch — several sections still contain explicit TODO(kunde) placeholders
 * (hosting provider, exact retention periods, WhatsApp variant used). Do not
 * ship this page as final legal text without that review. The same warning
 * is shown to visitors via the "legal.draftNotice" banner on the page.
 */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { DraftNotice, LegalSectionList } from '@/components/pages/legal-section-list';
import { FinalCta } from '@/components/pages/final-cta';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/datenschutz', noIndex: true });
}

export default async function DatenschutzPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.privacy');
  const tLegal = await getTranslations('legal');

  const sections = t.raw('sections') as { id: string; title: string; paragraphs: string[] }[];

  return (
    <>
      <PageHero title={t('heading')} subtitle={t('intro')} />

      <Section>
        <Container>
          <div className="flex flex-col gap-10">
            <Reveal>
              <DraftNotice text={tLegal('draftNotice')} />
            </Reveal>

            <Reveal>
              <p className="text-sm text-ink-faint">{t('updated')}</p>
            </Reveal>

            <LegalSectionList sections={sections} />
          </div>
        </Container>
      </Section>

      <FinalCta compact />
    </>
  );
}
