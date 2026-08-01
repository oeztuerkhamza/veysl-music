import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

/**
 * Schließt die Lücke zwischen „im Admin gespeichert" und „auf der Seite zu
 * sehen".
 *
 * Bis hierher gab es die nicht. Jede Seite dieses Projekts wird statisch
 * vorgerendert (`next build`), und `<SiteImage>` liest den Slot über
 * `resolveSlot()` **während** dieses Renderings. Es gibt kein `revalidate`,
 * kein `revalidatePath`, kein `revalidateTag` — nachgeprüft, im ganzen `src/`
 * kam keins davon vor. Praktisch hieß das: ein im Adminpanel hochgeladenes
 * Foto erschien erst beim nächsten Deploy. Nicht nach einer Minute, nicht nach
 * einer Stunde — gar nicht.
 *
 * Für den Betreiber ist das der schlimmste Fehlermodus, den ein CMS haben
 * kann: Das Speichern funktioniert, die Bestätigung erscheint, und die Seite
 * bleibt gleich. Es sieht aus wie „das Bild ist falsch hochgeladen", nicht wie
 * „die Seite wird nie neu gebaut".
 *
 * `revalidatePath('/', 'layout')` wirft den gesamten Seitencache weg statt
 * einzelner Pfade. Das ist hier richtig und nicht faul: Ein Slot wie
 * `home.hero.background` steckt in einer Seite, `services.wedding.image` in
 * mehreren, und dynamische Slots (`city.header.background.stuttgart`) in je
 * einer von über zwanzig Stadtseiten — die Zuordnung Slot → Seite steht
 * nirgends und wäre eine zweite Wahrheit, die veraltet. Bilder ändern sich
 * selten; ein vollständiges Neu-Rendern kostet hier nichts Nennenswertes.
 *
 * Der Import liegt bewusst *innerhalb* der Hooks: `next/cache` gehört zur
 * Next-Laufzeit, und dieselbe Payload-Konfiguration wird auch von der
 * Payload-CLI geladen (`payload generate:types`), die ohne Next läuft. Ein
 * Import auf Modulebene würde die dort scheitern lassen. Aus demselben Grund
 * schluckt der `catch` den Fehler: Ein fehlgeschlagenes Revalidieren darf
 * niemals das Speichern des Datensatzes rückgängig machen.
 */
async function revalidateSite(label: string): Promise<void> {
  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/', 'layout');
  } catch (err) {
    console.warn(`[cms] ${label}: revalidate skipped —`, err instanceof Error ? err.message : err);
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ collection }) => {
  await revalidateSite(`${collection.slug} afterChange`);
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ collection }) => {
  await revalidateSite(`${collection.slug} afterDelete`);
};
