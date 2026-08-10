import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { AnalyticsRoot } from '@/components/analytics';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { StickyCtaBar } from '@/components/layout/sticky-cta-bar';
import { WhatsAppFab } from '@/components/booking/whatsapp-fab';
import { CmsEditLayer } from '@/components/cms/edit-layer';
import { WhatsappModalProvider } from '@/components/whatsapp/whatsapp-modal-provider';
import { pickClientMessages } from '@/i18n/client-messages';
import { localeDirs, localeTags, routing, type Locale } from '@/i18n/routing';
import { fontDisplay, fontDisplayArabic, fontSansArabic } from '@/lib/fonts';
import { siteBaseUrl } from '@/lib/seo';
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

  return {
    /**
     * `siteBaseUrl()`, nicht `site.url`: Auf einer Vorschau-/Staging-Umgebung
     * setzt `NEXT_PUBLIC_SITE_URL` den Host, und `buildMetadata()` folgt dem
     * bereits. Ein fest verdrahtetes `site.url` hier hätte Layout und Seiten
     * auf verschiedene Hosts zeigen lassen.
     */
    metadataBase: new URL(siteBaseUrl()),
    title: {
      template: `%s | ${site.name}`,
      default: `${site.name} — ${localized(site.tagline, locale)}`,
    },
    description: localized(site.tagline, locale),
    /**
     * KEIN `alternates` hier — bewusst entfernt (August 2026).
     *
     * Das Layout stempelte den Startseiten-Canonical plus den vollständigen
     * hreflang-Satz auf JEDE Route darunter. Sichtbar wurde das bisher nicht,
     * weil alle Seiten ihn über `buildMetadata()` überschreiben (Next ersetzt
     * das `alternates`-Objekt der Elternebene komplett, es wird nicht
     * gemischt). Genau das machte es aber zu einer scharf gestellten Falle:
     * die erste Seite, die kein eigenes `generateMetadata` mitbringt, würde
     * sich per rel=canonical selbst auf die Startseite konsolidieren — und
     * indexierbar bleiben, weil `robots` dort ebenfalls voreingestellt ist.
     *
     * Canonical und hreflang gehören ausschließlich zu `buildMetadata()`
     * (src/lib/seo.ts), das sie pro Seite und pro tatsächlich vorhandener
     * Sprachfassung berechnet. Dasselbe gilt für die URL-abhängigen
     * OpenGraph-Felder; `siteName` bleibt, weil es routenunabhängig ist.
     */
    openGraph: {
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

  /**
   * Schreibrichtung und Schriften hängen an derselben Entscheidung.
   *
   * Die beiden Zweige sind bewusst **nicht** symmetrisch:
   *
   * - `rtl` (`/ar`) setzt beide Variablen — Amiri für Überschriften, IBM Plex
   *   Sans Arabic für den Fließtext. Der Systemstapel ist hier keine Option:
   *   Welche arabische Schrift ein Gerät mitbringt, ist von iPhone zu Android
   *   zu Windows völlig verschieden.
   * - Lateinisch setzt **nur** `--font-display`. `--font-sans` bleibt
   *   absichtlich leer, damit der Fließtext die Systemschrift des Geräts
   *   bekommt; Inter ist entfallen (134 KB, Begründung in `@/lib/fonts`).
   *
   * Diese Weiche entscheidet, welche Schrift *benutzt* wird — nicht, welche
   * geladen wird. Das steuert `preload` in `@/lib/fonts`; dort steht auch,
   * warum die deutsche Startseite nicht mehr 840 KB Schrift vorlädt.
   */
  const dir = localeDirs[locale];
  const fontVariables =
    dir === 'rtl'
      ? `${fontDisplayArabic.variable} ${fontSansArabic.variable}`
      : fontDisplay.variable;

  return (
    <html
      lang={localeTags[locale]}
      dir={dir}
      suppressHydrationWarning
      className={fontVariables}
    >
      <body className="flex min-h-dvh flex-col bg-bg font-sans text-ink antialiased">
        {/* Nur die Namensräume, die eine Client-Komponente wirklich aufruft —
            die Liste und ihre Begründung stehen in `@/i18n/client-messages`.
            Server-Komponenten lesen ihre Texte weiterhin vollständig über
            `getTranslations()`; hier geht es ausschließlich um das, was im
            HTML jeder Seite mitreisen muss. */}
        <NextIntlClientProvider messages={pickClientMessages(messages)}>
          {/* `enableSystem={false}` ist eine Markenentscheidung, kein Versehen:
              das warme Elfenbein IST die Gestaltung. Mit Systemerkennung
              bekämen alle Besucherinnen und Besucher mit dunkel gestelltem
              Telefon — also die Mehrheit — die Seite nie so zu sehen, wie sie
              gemeint ist. Der Umschalter bleibt; wer dunkel will, wählt es. */}
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <a href="#main" className="skip-link">
              {t('skipToContent')}
            </a>
            {/*
              `<AudioDock>` stand hier und ist entfallen — nicht als Aufräumen,
              sondern weil er nichts mehr tun konnte.

              Er brachte `AudioProvider`, `GlobalPlayer`, `TrackCard` und die
              WebGL-nahe `AudioReactive` auf **jede** Seite. Der Player rendert
              `null`, solange kein Titel läuft; ein Titel kann aber nur über
              `TrackList`/`MusicExplorer` starten, und die hingen an der
              Musik-Seite, die im August 2026 abgeschaltet wurde (siehe die
              Weiterleitungen in `next.config.ts`). Zusätzlich steht in
              `src/content/mixes.ts` bei allen sieben Sets `src: null`. Es gab
              also keinen Weg mehr, den Player überhaupt sichtbar zu machen —
              sein JavaScript wurde trotzdem auf jeder Seite geladen und
              hydriert.

              Die Bauteile bleiben unverändert liegen. Sobald echte Aufnahmen
              und eine Seite dafür existieren, ist das hier wieder eine Zeile.
            */}
            <WhatsappModalProvider whatsappNumber={whatsappNumber}>
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
                {/* Provider-Bootstrap, automatische Instrumentierung und
                    Consent-Banner in einem. Ohne diese Zeile existierte die
                    gesamte Analytics-Schicht nur als Quelltext: Kein Skript
                    ging je an den Browser, also gab es zu keiner Seite und zu
                    keiner Stadt Daten — bei einem Projekt, dessen nächster
                    Schritt „nachsehen, wofür wir ranken" ist, ist das der
                    teuerste blinde Fleck. Rendert nichts Sichtbares außer dem
                    Banner (position: fixed), Platzierung im Baum ist daher
                    layout-neutral. Jeder Provider bleibt aus, solange seine
                    NEXT_PUBLIC_*-Variable leer ist. Siehe docs/ANALYTICS.md §5. */}
                <AnalyticsRoot />
            </WhatsappModalProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
