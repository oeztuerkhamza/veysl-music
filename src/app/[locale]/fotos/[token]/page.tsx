import type { Metadata } from 'next';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { HeartHandshake } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { getWeddingByUploadToken } from '@/lib/weddings';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { WeddingUploadForm } from '@/components/upload/wedding-upload-form';

/**
 * Die Seite, die ein Brautpaar über seinen persönlichen Link öffnet, um Fotos
 * und kurze Videos zu schicken.
 *
 * Zwei Eigenschaften, die sie vom Rest der Website unterscheiden:
 *
 *   - **Nicht indexierbar und nicht verlinkt.** Sie steht in keiner Navigation
 *     und in keiner Sitemap; erreichbar ist sie ausschließlich über den Token
 *     im Pfad. `noindex, nofollow` verhindert zusätzlich, dass ein
 *     weitergeleiteter Link über einen Crawler in die Suche gerät.
 *   - **Immer dynamisch.** Jede andere Seite dieses Projekts wird beim Build
 *     vorgerendert; diese kann es nicht, weil ihr Inhalt vom Token abhängt und
 *     Tokens erst nach dem Build entstehen.
 *
 * Ein unbekannter, zurückgezogener oder abgeschalteter Token führt zu
 * demselben freundlichen Hinweis — nicht zu einer 404-Seite und nicht zu einer
 * Unterscheidung zwischen „gab es nie“ und „ist abgelaufen“.
 */

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: Locale; token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'upload' });
  return {
    // `absolute`, weil das Layout sonst sein `%s | DJ Veys` anhängt und der
    // Titel „Fotos hochladen — DJ Veys | DJ Veys“ hieße.
    title: { absolute: t('metaTitle') },
    robots: { index: false, follow: false },
  };
}

export default async function WeddingUploadPage({ params }: PageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('upload');
  const wedding = await getWeddingByUploadToken(token);

  /**
   * Der `upload`-Namensraum reist nur auf DIESER Seite in den Browser.
   *
   * Der naheliegende Weg wäre gewesen, ihn in `CLIENT_NAMESPACES`
   * einzutragen (`@/i18n/client-messages`) — dann läge er aber im HTML
   * **jeder** Seite, also auf allen ~279 vorgerenderten Seiten, für ein
   * Formular, das nur über einen geheimen Link erreichbar ist. Genau gegen
   * dieses Zuwachsen ist jene Liste geschrieben. Ein zweiter, verschachtelter
   * Provider ist der vorgesehene Weg: Er ergänzt den Katalog des Layouts nur
   * hier.
   */
  const messages = await getMessages();

  if (!wedding) {
    return (
      <Section>
        <Container size="narrow">
          <div className="mx-auto max-w-lg rounded-lg border border-line bg-surface p-8 text-center">
            <HeartHandshake className="mx-auto size-8 text-gold" aria-hidden="true" />
            <h1 className="mt-4 font-display text-2xl text-ink">{t('invalid.title')}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t('invalid.text')}</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container size="narrow">
        <header className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.15em] text-gold">{t('eyebrow')}</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            {t('title', { couple: wedding.coupleLabel })}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">{t('intro')}</p>
        </header>

        <NextIntlClientProvider messages={{ upload: messages.upload }}>
          <WeddingUploadForm token={token} />
        </NextIntlClientProvider>
      </Container>
    </Section>
  );
}
