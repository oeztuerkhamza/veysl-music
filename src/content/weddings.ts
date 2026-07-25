/**
 * TODO(kunde): Referenz-Hochzeiten (Foto/Video, Eckdaten) liegen noch nicht
 * in freigegebener Form vor. Das bestehende Material in
 * public/images/legacy/ enthält laut .claude/BRAND-FACTS.md KEIN einziges
 * echtes Hochzeitsfoto (kein Paar, keine Tanzfläche, keine Location) — daher
 * bleibt diese Liste bewusst leer, bis der Kunde professionelle Fotos/Video
 * von echten Hochzeiten liefert. NICHT mit erfundenen Paaren/Locations
 * befüllen. Die Seite "echte-hochzeiten" rendert währenddessen einen
 * gestalteten Leerzustand (weddings.empty).
 */

export interface WeddingReference {
  id: string;
  /** z. B. "A. & B." — nur mit ausdrücklichem Einverständnis des Paares. */
  coupleLabel: string;
  city: string;
  /** Verweist auf eine Venue-Id in venues.ts. */
  venueId?: string;
  guestCount?: number;
  /** ISO-Datum, z. B. "2026-06-14". */
  date?: string;
  coverImage: { src: string; alt: string; width: number; height: number };
  videoUrl?: string;
  gallery?: { src: string; alt: string; width: number; height: number }[];
}

export const weddings: WeddingReference[] = [];
