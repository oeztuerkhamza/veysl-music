/**
 * Reine Reihenfolge-/ID-Referenz für die FAQ auf der Ablauf-Seite. Die
 * eigentlichen Fragen & Antworten werden server-seitig direkt aus
 * messages/*.json → "process.faq" gelesen (t.raw('faq')), damit sie
 * vollständig im HTML landen (FAQ-Schema/GEO-Zitierbarkeit) statt erst per
 * Client-JS nachgeladen zu werden.
 *
 * Diese Datei liefert nur stabile, sprachneutrale Anker-IDs in derselben
 * Reihenfolge wie das Array in den messages — praktisch für <details id>,
 * FAQPage-Schema-Anchors etc.
 */

export interface FaqRef {
  id: string;
}

export const faqOrder: FaqRef[] = [
  { id: 'booking-lead-time' },
  { id: 'pricing' },
  { id: 'song-requests' },
  { id: 'ceremony-sound' },
  { id: 'turkish-weddings' },
  { id: 'equipment-failure' },
  { id: 'setup-teardown' },
  { id: 'insurance' },
  { id: 'destination-weddings' },
  { id: 'payment' },
];
