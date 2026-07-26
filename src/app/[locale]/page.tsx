import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';
import { localBusinessSchema, websiteSchema } from '@/lib/schema';
import { Hero } from '@/components/hero/hero';
import { Intro } from '@/components/home/intro';
import { TrustStrip } from '@/components/home/trust-strip';
import { StatsBand } from '@/components/home/stats-band';
import { ServicesPreview } from '@/components/home/services-preview';
import { Showreel } from '@/components/home/showreel';
import { PackagesPreview } from '@/components/home/packages-preview';
import { MusicPreview } from '@/components/home/music-preview';
import { Testimonials, type Testimonial } from '@/components/home/testimonials';
import { ProcessPreview } from '@/components/home/process-preview';
import { ServiceAreas } from '@/components/home/service-areas';
import { FinalCta } from '@/components/home/final-cta';

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/', values: { city: site.city } });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // TODO: swap in `import { testimonials } from '@/content/testimonials'` once the
  // pages agent ships that module — until then, ship nothing rather than fake quotes.
  const testimonials: Testimonial[] = [];

  // Entity graph for AI/GEO citations: the site itself + the bookable business/act.
  // NOTE: this should be `<JsonLd data={jsonLd} />` from `@/lib/schema.tsx`, but that
  // file and `@/lib/schema.ts` share a base name — the bare `@/lib/schema` specifier
  // resolves only to the `.ts` builders, making the `.tsx` component unreachable
  // without an explicit extension (unsupported without `allowImportingTsExtensions`).
  // Inlined here until the SEO agent renames one of the two files.
  const jsonLd = JSON.stringify([websiteSchema(locale), localBusinessSchema(locale)]).replace(
    /</g,
    '\\u003c',
  );

  return (
    <>
      {/* JSON-LD hat keinen anderen unterstützten Renderpfad. (`react/no-danger` ist in dieser Config nicht aktiv.) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <Hero />
      <Intro />
      <TrustStrip />
      <StatsBand />
      <ServicesPreview />
      <Showreel />
      <PackagesPreview />
      <MusicPreview />
      <Testimonials testimonials={testimonials} />
      <ProcessPreview />
      <ServiceAreas />
      <FinalCta />
    </>
  );
}
