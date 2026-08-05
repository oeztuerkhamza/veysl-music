/**
 * Die Sprachcodes der Website, für `select`-Felder in den Collections.
 *
 * Warum eine eigene Konstante und nicht `locales` aus `src/i18n/routing.ts`:
 * Die Collections importieren ausschließlich relativ und aus `payload` — kein
 * `@/`-Alias. `payload generate:types` und `payload migrate` laden diese
 * Dateien über die Payload-CLI, nicht über den Next-Build, und damit ohne die
 * Pfad-Aliase aus `tsconfig.json`. Ein Import von `@/i18n/routing` würde die
 * Typgenerierung und die Migrationen brechen, also bleibt es bei einer Kopie.
 *
 * ⚠️ Sie muss `locales` in `src/i18n/routing.ts` spiegeln. Vorher stand
 * dieselbe Liste dreimal wörtlich in `enquiries.ts`, `contact-messages.ts` und
 * `whatsapp-leads.ts` — beim Hinzufügen von `ar` mussten alle drei angefasst
 * werden, und ein vergessener Eintrag hätte bedeutet, dass eine echte Anfrage
 * mit einer Sprache ankommt, die das Feld nicht kennt. Eine Kopie ist
 * unvermeidbar, drei sind es nicht.
 */
export const SITE_LOCALE_OPTIONS = ['de', 'tr', 'ku', 'ar', 'en', 'nl', 'fr', 'es'] as const;
