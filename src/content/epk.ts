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
 * Bild-Slots: seit der Kundenlieferung vom 02.08.2026 stehen für beide Slots
 * bessere Aufnahmen bereit als die bisherigen aus public/images/legacy/ — das
 * Alpen-Wanderbild ist der Bağlama-Aufnahme gewichen (erzählt zusätzlich die
 * Musikergeschichte), der leere weiße Raum dem fertig eingerichteten Saal.
 * Die Legacy-Dateien bleiben liegen, werden aber nicht mehr referenziert; das
 * Stockfoto 05-86ab7620.jpg (NICHT Veysel) bleibt gesperrt.
 *
 * Die Maße unten sind die echten Pixelmaße der Dateien — `next/image` braucht
 * sie für die Reservierung des Platzes; ein falscher Wert erzeugt genau das
 * Layout-Springen, das der Rest des Projekts sorgfältig vermeidet.
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
    src: '/images/veys/saz-bank-4x5.jpg',
    alt: 'Veysel Durmuş spielt Bağlama auf einer Bank im Freien, Weinberge und Ortschaft im Hintergrund',
    width: 1278,
    height: 1597,
  },
  setupDetail: {
    src: '/images/veys/setup-licht-4x5.jpg',
    alt: 'Veysel Durmuş an seinem beleuchteten DJ-Pult, Bodennebel und Lichtstimmung im Saal',
    width: 959,
    height: 1199,
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
