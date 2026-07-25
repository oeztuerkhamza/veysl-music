/**
 * TODO(kunde): Reale Preise (priceFrom) liegen noch nicht vor. Bis dahin
 * bleibt der Wert `null` und die UI zeigt "Preis auf Anfrage"
 * (common.onRequest) statt einer erfundenen Zahl. Die Texte selbst kommen aus
 * messages/*.json → Namespace "packages.items".
 */

export type PackageId = 'essential' | 'signature' | 'prestige';

export interface PackageItem {
  id: PackageId;
  /** null = Preis wird aktuell nicht öffentlich kommuniziert (siehe TODO oben). */
  priceFrom: number | null;
  /** Maximale Spielzeit in Stunden. null = keine feste Obergrenze (Prestige). */
  hoursMax: number | null;
  /** Maximale Gästezahl. null = kein fester Deckel (Prestige: 150+, mehrere Zonen). */
  guestsMax: number | null;
  /** Anzahl der Bullet-Points in messages "packages.items.<id>.features". */
  featureCount: number;
  /** Signature ist laut messages "packages.items.signature.description" das meistgebuchte Paket. */
  highlighted: boolean;
}

export const packages: PackageItem[] = [
  { id: 'essential', priceFrom: null, hoursMax: 6, guestsMax: 80, featureCount: 5, highlighted: false },
  { id: 'signature', priceFrom: null, hoursMax: 10, guestsMax: 150, featureCount: 7, highlighted: true },
  { id: 'prestige', priceFrom: null, hoursMax: null, guestsMax: null, featureCount: 7, highlighted: false },
];
