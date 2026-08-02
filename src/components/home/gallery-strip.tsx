import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { gallery } from '@/content/gallery';

/** How many frames the strip shows before it starts repeating the gallery page. */
const MAX = 6;

/**
 * Photo strip on the homepage, linking through to the full gallery.
 *
 * The reason this exists: the homepage had exactly two photographs on it (the
 * hero backdrop and the showreel still), and everything between them was type.
 * That was the correct design while there was nothing real to show — but the
 * client's photos landed, the gallery page filled up, and the homepage was
 * still the one page that did not benefit. In this market the pictures are the
 * argument; a visitor comparing three DJs decides here, not on an inner page.
 *
 * Renders `null` when `gallery` is empty, so it degrades to exactly what the
 * page looked like before rather than to a row of placeholder boxes. The
 * gallery is curated to one aspect ratio (see `src/content/gallery.ts`), which
 * is what lets this be a plain grid with no per-item measuring.
 */
export async function GalleryStrip() {
  const items = gallery.filter((item) => item.type === 'photo').slice(0, MAX);
  if (items.length === 0) return null;

  const t = await getTranslations('home.gallery');

  return (
    <Section id="eindruecke" className="bg-surface">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.05}>
              {/*
                Das ganze Feld ist der Link, nicht nur eine Bildunterschrift:
                Ein Foto, das aussieht wie ein Ausschnitt aus einer Galerie,
                wird angeklickt — dann sollte es auch klickbar sein.
              */}
              <Link
                href="/galerie"
                className="group block overflow-hidden rounded-lg border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <Button href="/galerie" variant="secondary" size="md">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
