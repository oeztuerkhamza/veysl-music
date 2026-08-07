import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { localBusinessSchema, serviceSchema, websiteSchema } from '@/lib/schema';
import { services } from '@/content/services';
import { firstPartyAggregate, getPublishedTestimonials } from '@/lib/testimonials';
import { Hero } from '@/components/hero/hero';
import { StageBand } from '@/components/home/stage-band';
import { Intro } from '@/components/home/intro';
import { TrustStrip } from '@/components/home/trust-strip';
import { ServicesPreview } from '@/components/home/services-preview';
import { Showreel } from '@/components/home/showreel';
import { GalleryStrip } from '@/components/home/gallery-strip';
import { PackagesPreview } from '@/components/home/packages-preview';
import { Testimonials, type Testimonial } from '@/components/home/testimonials';
import { GoogleReviews } from '@/components/home/google-reviews';
import { ProcessPreview } from '@/components/home/process-preview';
import { ServiceAreas } from '@/components/home/service-areas';
import { StuttgartLocal } from '@/components/home/stuttgart-local';
import { FinalCta } from '@/components/home/final-cta';
import { InstagramStrip, YouTubeStrip } from '@/components/social';

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

  // Real, operator-approved quotes from the Payload `testimonials` collection.
  // Until now this was a hardcoded empty array, so anything entered in the
  // admin never reached the page. Empty stays a valid state — the section
  // renders nothing rather than inventing quotes.
  const published = await getPublishedTestimonials();
  const testimonials: Testimonial[] = published.map((t) => ({
    quote: t.quote,
    author: t.authorName,
    venue: t.venue ?? '',
    date: t.eventDate ?? '',
  }));

  // The only ratings allowed to become `aggregateRating` — see the note on
  // that builder. `null` until at least three testimonials carry a rating,
  // which is also the state today.
  const firstPartyRating = firstPartyAggregate(published);

  // Entity graph for AI/GEO citations: the site itself + the bookable business/act.
  // NOTE: this should be `<JsonLd data={jsonLd} />` from `@/lib/schema.tsx`, but that
  // file and `@/lib/schema.ts` share a base name — the bare `@/lib/schema` specifier
  // resolves only to the `.ts` builders, making the `.tsx` component unreachable
  // without an explicit extension (unsupported without `allowImportingTsExtensions`).
  // Inlined here until the SEO agent renames one of the two files.
  // Was hier gebucht werden kann, stand bisher nirgends maschinenlesbar: Die
  // Startseite ist die Zielseite für „Hochzeits-DJ Stuttgart", trug aber nur
  // die Identität des Unternehmens, keine einzige Leistung. Dieselben bereits
  // übersetzten Strings, die /hochzeit-events rendert — kein neuer Text.
  const tServices = await getTranslations('services');
  const serviceNodes = serviceSchema(
    services.map((service) => ({
      // Derselbe `slug` wie auf /hochzeit-events: beide Seiten beschreiben
      // dieselben vier Leistungen und verweisen deshalb auf denselben Knoten,
      // statt ihn zu duplizieren.
      slug: service.id,
      name: tServices(`items.${service.id}.title`),
      description: tServices(`items.${service.id}.text`),
      url: absoluteUrl('/hochzeit-events', locale),
    })),
    locale,
  );

  const jsonLd = JSON.stringify([
    websiteSchema(locale),
    localBusinessSchema(locale, firstPartyRating),
    ...serviceNodes,
  ]).replace(/</g, '\\u003c');

  return (
    <>
      {/* JSON-LD hat keinen anderen unterstützten Renderpfad. (`react/no-danger` ist in dieser Config nicht aktiv.) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* <StatsBand> used to sit here. Its three figures (12+ / 200+ / DE·TR·EN)
          are now the hero's marginalia column, where they do the same job
          above the fold instead of repeating it 1.400 px further down. */}
      <Hero />
      {/* Das Bühnenfoto lag vorher als Hintergrund IM Hero. Dort folgte seine
          Fläche dem Fenster, also schnitt `object-cover` es aus einer Richtung
          an, die von Gerät zu Gerät wechselt — es sah angeschnitten aus. Hier
          steht es eine Etage tiefer in fester 21:9-Geometrie, unabhängig vom
          Hero und ohne Abdunklung. Siehe `home.stage.image`. */}
      <StageBand />
      <Intro />
      <TrustStrip />
      <ServicesPreview />
      <Showreel />
      {/* Direkt hinter dem Showreel: Dort erwartet man nach dem Standbild
          ohnehin mehr Bildmaterial, und der Streifen fängt genau die Leute ab,
          die noch keinen Aftermovie zu sehen bekommen. Rendert `null`, solange
          `src/content/gallery.ts` leer ist. */}
      <GalleryStrip />
      <PackagesPreview />
      {/*
        <MusicPreview> stand hier und ist mit der Musik-Seite entfallen.
        Nicht nur, weil sein Knopf ins Leere zeigte: Der Abschnitt hieß
        „Reinhören statt raten" und bot „Alle Sets anhören" an, während in
        `src/content/mixes.ts` bei allen sieben Sets `src: null` steht. Es gab
        also nichts zu hören — die Überschrift war schon vor dem Löschen ein
        Versprechen, das die Seite nicht einlösen konnte.

        Komponente und `mixes.ts` bleiben liegen. Sobald echte Aufnahmen
        vorliegen, ist der Abschnitt eine Zeile Arbeit — und dann stimmt auch
        seine Überschrift.
      */}
      <Testimonials testimonials={testimonials} />
      {/* Renders nothing until GOOGLE_PLACES_API_KEY is set on the server. */}
      <GoogleReviews locale={locale} />
      {/*
        Beide Strips waren gebaut, übersetzt und nirgends eingebunden — sie
        standen seit ihrer Entstehung in `src/components/social/`, ohne dass
        eine einzige Seite sie gerendert hätte.

        Platziert direkt hinter den Google-Bewertungen: Das ist der Block, in
        dem die Seite ohnehin von fremden Stimmen auf eigene Belege umschaltet.
        Beide vertragen einen leeren Zustand (`<SocialEmptyState>`), fallen
        also nicht auf, solange eine Quelle noch keine Daten liefert.
      */}
      <YouTubeStrip />
      <InstagramStrip />
      <ProcessPreview />
      {/* Stuttgart-Substanz auf der Seite, die für „Hochzeits-DJ Stuttgart"
          ranken soll — siehe Dateikopf von stuttgart-local.tsx. */}
      <StuttgartLocal />
      <ServiceAreas />
      <FinalCta />
    </>
  );
}
