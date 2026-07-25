/**
 * TODO(kunde): Presse-Fotos (ZIP), Technical Rider (PDF) und das vollständige
 * EPK-PDF existieren noch nicht als Dateien — Downloads bleiben `href: null`
 * und werden im UI als "in Vorbereitung" dargestellt (epk.downloadPending).
 * Partner-Logos und Presseerwähnungen sind unverifiziert und bleiben leer,
 * bis der Kunde sie freigibt.
 *
 * Die Biografie-Texte selbst stehen (aus verifizierten Angaben in
 * .claude/BRAND-FACTS.md) in messages/*.json unter "epk.bio" — nicht hier,
 * da es sich um übersetzte Fließtext-Prosa handelt, kein Stammdatum.
 *
 * Bild-Slots: laut der aktualisierten Media-Review in
 * .claude/BRAND-FACTS.md gibt es in public/images/legacy/ kein einziges
 * echtes Hochzeitsfoto, aber zwei Aufnahmen, die für genau diese EPK-Slots
 * freigegeben sind. Alles andere (inkl. des Stockfotos 05-86ab7620.jpg, das
 * NICHT Veysel zeigt) bleibt unangetastet.
 */

export interface EpkImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const epkImages: {
  /** Persönliches Bild neben der Bio (Bergwandern/Auftanken-Kontext). */
  personalStory: EpkImage | null;
  /** Kleines Detailbild "Setup & Soundcheck" — bewusst nicht als Hero. */
  setupDetail: EpkImage | null;
} = {
  personalStory: {
    src: '/images/legacy/08-2ef27d08.jpg',
    alt: 'Veysel Durmuş beim Wandern in den Alpen',
    width: 1500,
    height: 2000,
  },
  setupDetail: {
    src: '/images/legacy/01-156b4efb.jpg',
    alt: 'Veysel Durmuş an seinem DJ-Pult beim Soundcheck',
    width: 1500,
    height: 2000,
  },
};

export type EpkDownloadId = 'press' | 'rider' | 'epk';

export interface EpkDownload {
  id: EpkDownloadId;
  /** null = Datei liegt noch nicht vor → UI zeigt einen deaktivierten "in Vorbereitung"-Button. */
  href: string | null;
}

export interface PressMention {
  id: string;
  outlet: string;
  url?: string;
  date?: string;
}

export interface PartnerLogo {
  id: string;
  name: string;
  logo?: { src: string; alt: string; width: number; height: number };
  url?: string;
}

export const epkDownloads: EpkDownload[] = [
  { id: 'press', href: null },
  { id: 'rider', href: null },
  { id: 'epk', href: null },
];

export const pressMentions: PressMention[] = [];
export const partnerLogos: PartnerLogo[] = [];
