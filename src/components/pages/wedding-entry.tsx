import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { PostBody } from '@/components/blog/post-body';
import { formatDate } from '@/lib/utils';
import type { WeddingReference } from '@/lib/weddings';
import { VideoFacade } from './video-facade';

interface WeddingEntryProps {
  wedding: WeddingReference;
  /** BCP-47-Tag für die Datumsformatierung, z. B. `de-DE`. */
  localeTag: string;
  labels: {
    guests: string;
    story: string;
    photos: string;
    videos: string;
    play: string;
  };
}

/** Bekannte Maße → echtes Seitenverhältnis, sonst 3:2. Verhindert Layout-Sprünge beim Laden. */
function aspectRatio(width?: number, height?: number): string {
  return width && height ? `${width} / ${height}` : '3 / 2';
}

/**
 * Eine Referenz-Hochzeit in voller Länge: Titelbild, Fließtext, Fotogalerie
 * und YouTube-Videos.
 *
 * Bewusst keine Karte mit Weiterleitung auf eine Detailseite. Die entfernte
 * Vorgänger-Komponente `wedding-card.tsx` zeigte Paar, Stadt und Gästezahl
 * und sonst nichts — bei einer Handvoll Referenzen kostet eine zweite Ebene
 * mehr Klicks, als sie an Übersicht bringt, und der Text, der die Arbeit
 * eigentlich erklärt, käme nie ins Bild. Hier steht alles auf einer Seite,
 * untereinander.
 *
 * Videos laufen über `VideoFacade`: Vorschaubild plus Abspielfläche, das
 * `<iframe>` entsteht erst nach dem Klick. Auf einer Seite mit mehreren
 * Hochzeiten × mehreren Videos wäre alles andere ein Dutzend YouTube-
 * Einbettungen beim ersten Rendern.
 */
export function WeddingEntry({ wedding, localeTag, labels }: WeddingEntryProps) {
  const meta = [
    wedding.city,
    wedding.venue,
    wedding.date ? formatDate(wedding.date, localeTag) : undefined,
    wedding.guestCount ? `${wedding.guestCount} ${labels.guests}` : undefined,
  ].filter((part): part is string => Boolean(part));

  return (
    <article
      // Ankerpunkt der Bearbeitungsschicht: `WeddingEditor` hängt seine
      // Knöpfe an dieses Attribut, genau wie `EditOverlay` an
      // `[data-cms-slot]`. Es gibt damit keine zweite Liste, die veralten
      // könnte — eine neue Hochzeit ist automatisch bearbeitbar.
      data-wedding-id={wedding.id}
      className="relative border-t border-line pt-12 first:border-t-0 first:pt-0"
    >
      <Reveal>
        <header className="max-w-2xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">{wedding.coupleLabel}</h2>
          {meta.length > 0 ? (
            <p className="mt-2 text-sm text-ink-muted">{meta.join(' · ')}</p>
          ) : null}
        </header>
      </Reveal>

      {wedding.cover ? (
        <Reveal>
          <div
            className="relative mt-8 overflow-hidden rounded-lg bg-surface-2"
            style={{ aspectRatio: aspectRatio(wedding.cover.width, wedding.cover.height) }}
          >
            <Image
              src={wedding.cover.src}
              alt={wedding.cover.alt}
              fill
              sizes="(min-width: 1024px) 60rem, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      ) : null}

      {wedding.story ? (
        <Reveal>
          <div className="mt-10 max-w-2xl">
            <h3 className="sr-only">{labels.story}</h3>
            {/* Markdown → echte Elemente, nie `dangerouslySetInnerHTML` —
                derselbe Renderer wie im Ratgeber, damit ein im CMS
                geschriebener Text genauso aussieht wie ein Artikel. */}
            <PostBody body={wedding.story} />
          </div>
        </Reveal>
      ) : null}

      {wedding.gallery.length > 0 ? (
        <section className="mt-10" aria-label={labels.photos}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wedding.gallery.map((photo) => (
              <Reveal key={photo.src}>
                <div
                  className="relative overflow-hidden rounded-lg bg-surface-2"
                  style={{ aspectRatio: aspectRatio(photo.width, photo.height) }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {wedding.videos.length > 0 ? (
        <section className="mt-10" aria-label={labels.videos}>
          <div className="grid gap-6 sm:grid-cols-2">
            {wedding.videos.map((video) => (
              <Reveal key={video.id}>
                <figure>
                  <VideoFacade
                    videoUrl={video.embedUrl}
                    posterSrc={video.thumbnailUrl}
                    posterAlt={video.title ?? `${labels.videos} — ${wedding.coupleLabel}`}
                    width={480}
                    height={360}
                    playLabel={labels.play}
                  />
                  {video.title ? (
                    <figcaption className="mt-2 text-sm text-ink-muted">{video.title}</figcaption>
                  ) : null}
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
