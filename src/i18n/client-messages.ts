import type { AbstractIntlMessages } from 'next-intl';

/**
 * Die Namensräume, die tatsächlich in den Browser müssen — und nur die.
 *
 * ── Warum es diese Datei gibt ───────────────────────────────────────────────
 *
 * `[locale]/layout.tsx` hat den kompletten Sprachkatalog an
 * `<NextIntlClientProvider messages={…}>` gereicht. Alles, was dieser Provider
 * bekommt, wird in den RSC-Payload serialisiert und liegt damit als Text im
 * ausgelieferten HTML **jeder einzelnen Seite**.
 *
 * Am gebauten HTML nachgemessen (deutsche Startseite): 60 KB Nachrichten in
 * 276 KB HTML. Darin standen unter anderem der vollständige Impressums- und
 * Datenschutztext (`legal`, 10 KB), alle Länderseiten (`regions`, 6,4 KB), die
 * Ratgeber-Metadaten (`blog`) und die Texte der Baden-Württemberg-Seite (`bw`)
 * — auf der Startseite, die keines davon anzeigt, und in einem Block, den der
 * Browser vor der Hydration vollständig parsen muss.
 *
 * Server-Komponenten sind davon nicht betroffen: Sie lesen ihre Texte über
 * `getTranslations()` bzw. `useTranslations()` direkt auf dem Server. Diese
 * Liste ist deshalb ausschließlich die Antwort auf die Frage „welche
 * Komponente mit `'use client'` ruft `useTranslations(…)` auf?".
 *
 * ── Wenn eine Übersetzung im Browser fehlt ──────────────────────────────────
 *
 * Symptom: In der Konsole steht `MISSING_MESSAGE`, und an der Stelle im
 * Interface erscheint der Schlüsselpfad statt des Textes. Ursache ist dann
 * praktisch immer eine neue oder neu zum Client gewanderte Komponente, deren
 * Namensraum hier fehlt. Eintragen — und den Kommentar dahinter mitschreiben,
 * damit die Liste nachvollziehbar bleibt und nicht aus Vorsicht wieder
 * zuwächst.
 *
 * Der Test dafür braucht kein Werkzeug: Wer `useTranslations` in einer Datei
 * ergänzt, prüft, ob in derselben Datei (oder in einer, die sie importiert)
 * `'use client'` steht.
 */
export const CLIENT_NAMESPACES = [
  /** Anfrageformular: alle Schritte, Kalender, Verfügbarkeit, Fehler- und Erfolgszustand. */
  'booking',
  /** `city-faq.tsx` — das einzige Stadt-Bauteil mit Interaktion. */
  'city',
  /** Formularbeschriftungen, die sich Anfrage- und Kontaktformular teilen. */
  'common',
  /** Consent-Banner und der Link, der die Auswahl später wieder öffnet. */
  'consent',
  /** Kontaktformular inkl. `contactForm.validation` aus `@/lib/contact`. */
  'contactForm',
  /** `response-time-badge.tsx`. */
  'cro',
  /** WhatsApp-FAB, mobile CTA-Leiste, Fehlerpanel. */
  'cta',
  /** `[locale]/error.tsx` — die Fehlergrenze ist immer eine Client-Komponente. */
  'errorPage',
  /** Kopfzeile und Sprachumschalter. */
  'nav',
  /** Hell/Dunkel-Umschalter. */
  'theme',
  /** Vorqualifizierungs-Dialog vor dem Sprung zu WhatsApp. */
  'whatsappFlow',
] as const;

/**
 * Reduziert den geladenen Katalog auf {@link CLIENT_NAMESPACES}.
 *
 * Ein fehlender Namensraum wird still übersprungen statt zu werfen: Die Liste
 * gilt für acht Sprachdateien, und eine noch nicht übersetzte Sektion soll
 * nicht die ganze Seite abschießen — sie fällt an genau der Stelle auf, an der
 * sie fehlt, so wie vorher auch.
 */
export function pickClientMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
  const picked: Record<string, unknown> = {};

  for (const namespace of CLIENT_NAMESPACES) {
    const value = messages[namespace];
    if (value !== undefined) picked[namespace] = value;
  }

  return picked as AbstractIntlMessages;
}
