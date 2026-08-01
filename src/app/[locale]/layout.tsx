import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { AudioDock } from '@/components/audio';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { StickyCtaBar } from '@/components/layout/sticky-cta-bar';
import { WhatsAppFab } from '@/components/booking/whatsapp-fab';
import { CmsEditLayer } from '@/components/cms/edit-layer';
import { WhatsappModalProvider } from '@/components/whatsapp/whatsapp-modal-provider';
import { getPathname } from '@/i18n/navigation';
import { localeTags, ogLocales, routing, type Locale } from '@/i18n/routing';
import { fontDisplay, fontSans } from '@/lib/fonts';
import { localized } from '@/lib/utils';
import { site } from '@/content/site';
import { getSite } from '@/content/get-site';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Nach diesem Zeitfenster darf eine Seite beim nächsten Aufruf im Hintergrund
 * neu gerendert werden. Gilt für den gesamten Segmentbaum darunter, also für
 * jede öffentliche Seite.
 *
 * Der Grund ist kein Wunsch nach Aktualität, sondern ein handfester Defekt:
 * Alle Seiten werden beim `next build` vorgerendert, und dieser Build läuft im
 * Docker-Image — zu einem Zeitpunkt, an dem `/app/data` noch nicht existiert.
 * Dort liegt aber die SQLite-Datei (`DATABASE_URI=file:/app/data/veysl-cms.db`,
 * eingehängt als Volume erst zur Laufzeit). Jeder `resolveSlot()`-Aufruf findet
 * beim Bauen also nichts und backt einen Platzhalter ins HTML.
 *
 * Wirkung ohne diese Zeile: **Jeder Deploy nimmt sämtliche CMS-Bilder wieder
 * von der Seite.** Nicht die Dateien — Datenbank und Medien-Volume überleben
 * beides —, sondern das vorgerenderte HTML, das sie vergessen hat. Genau das
 * war der Grund, warum ein frisch hochgeladenes Foto erst da war und nach dem
 * nächsten Deploy wieder weg.
 *
 * Zusammen mit den `afterChange`-Hooks (src/payload/revalidate.ts) ergibt das
 * zwei Wege zurück in den korrekten Zustand: sofort beim Speichern im Admin,
 * und spätestens nach diesem Fenster nach einem Deploy. Fünf Minuten, weil das
 * Neu-Rendern im Hintergrund passiert und CMS-Lesezugriffe ohnehin ein
 * Zeitlimit mit Fallback haben (`readFromCms`).
 *
 * ⚠️ Was das *nicht* repariert: Der allererste Aufruf nach einem Deploy
 * bekommt noch die gebaute Fassung. Erst der darauf folgende sieht die Bilder.
 */
export const revalidate = 300;

/**
 * Next 16 generiert die Route-Typen mit `locale: string`. Der Parameter wird
 * hier deshalb breit angenommen und erst per `hasLocale` auf `Locale`
 * verengt — sonst schlägt die Typprüfung beim Build fehl.
 */
type LayoutParams = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = hasLocale(routing.locales, rawLocale)
    ? rawLocale
    : routing.defaultLocale;

  const languages = Object.fromEntries(
    routing.locales.map((l) => [
      localeTags[l],
      new URL(getPathname({ locale: l, href: '/' }), site.url).toString(),
    ])
  );

  return {
    metadataBase: new URL(site.url),
    title: {
      template: `%s | ${site.name}`,
      default: `${site.name} — ${localized(site.tagline, locale)}`,
    },
    description: localized(site.tagline, locale),
    alternates: {
      canonical: new URL(getPathname({ locale, href: '/' }), site.url).toString(),
      languages: {
        ...languages,
        'x-default': new URL(getPathname({ locale: routing.defaultLocale, href: '/' }), site.url).toString(),
      },
    },
    openGraph: {
      locale: ogLocales[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
      siteName: site.name,
    },
    /**
     * Search-Console-Verifizierung, sofern hinterlegt.
     *
     * Bis hierher trug die Seite überhaupt kein `google-site-verification` —
     * nachgeprüft am ausgelieferten HTML der Startseite. Ohne verifizierte
     * Property gibt es keine Search Console, und ohne Search Console gibt es
     * keine Antwort auf die einzige Frage, die beim Ranking zuerst zählt:
     * *Ist die Seite überhaupt im Index, und für welche Suchanfragen wird sie
     * angezeigt?* Alles andere — Titel, Überschriften, Schema — ist Raten,
     * solange das offen ist. Die Sitemap kann dort ebenfalls erst nach der
     * Verifizierung eingereicht werden.
     *
     * Als Umgebungsvariable, nicht fest verdrahtet: Der Token gehört zur
     * Property, nicht zum Quellcode, und Staging-Umgebungen sollen ihn nicht
     * mitschleppen. Fehlt er, entfällt das Tag ersatzlos — Next lässt
     * `undefined` hier einfach weg.
     *
     * Einrichten: In der Search Console die Property `dj-veys.de` anlegen,
     * Methode „HTML-Tag" wählen, den `content`-Wert als
     * `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in die `.env` des Servers
     * schreiben, deployen, dann in der Search Console auf „Bestätigen".
     */
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations('common');
  // CMS-editable contact info (Payload global `site-settings`), resolved
  // once here and passed down as props — client components must never call
  // `getSite()` themselves (see src/content/get-site.ts).
  const resolvedSite = await getSite();
  const whatsappNumber = resolvedSite.contact.whatsapp;

  return (
    <html
      lang={localeTags[locale]}
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontSans.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-bg font-sans text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* `enableSystem={false}` ist eine Markenentscheidung, kein Versehen:
              das warme Elfenbein IST die Gestaltung. Mit Systemerkennung
              bekämen alle Besucherinnen und Besucher mit dunkel gestelltem
              Telefon — also die Mehrheit — die Seite nie so zu sehen, wie sie
              gemeint ist. Der Umschalter bleibt; wer dunkel will, wählt es. */}
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <a href="#main" className="skip-link">
              {t('skipToContent')}
            </a>
            <WhatsappModalProvider whatsappNumber={whatsappNumber}>
              <AudioDock>
                <Header />
                {/* No top padding here on purpose: every page's hero is meant
                    to sit full-bleed behind the transparent-over-hero header
                    (see header.tsx) and must account for its own height itself. */}
                <main id="main" className="flex-1">
                  {children}
                </main>
                <Footer />
                <StickyCtaBar />
                <WhatsAppFab />
                {/* Rendert für Besucher `null` und lädt seinen Chunk nie —
                    siehe den Kopf von edit-layer.tsx. */}
                <CmsEditLayer />
              </AudioDock>
            </WhatsappModalProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
