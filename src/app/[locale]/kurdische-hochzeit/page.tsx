import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';
import { WEDDING_CULTURE_SUPPORTED_LOCALES, isWeddingCultureLocale } from '@/content/wedding-cultures';
import type { Locale } from '@/i18n/routing';
import { CultureWeddingPage } from '@/components/pages/culture-wedding-page';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export function generateStaticParams() {
  return WEDDING_CULTURE_SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isWeddingCultureLocale(locale)) return {};

  return buildMetadata({
    locale,
    pathname: '/kurdische-hochzeit',
    availableLocales: [...WEDDING_CULTURE_SUPPORTED_LOCALES],
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isWeddingCultureLocale(locale)) notFound();

  return <CultureWeddingPage locale={locale} cultureId="kurdish" pathname="/kurdische-hochzeit" />;
}
