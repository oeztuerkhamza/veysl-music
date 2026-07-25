/**
 * Mix-Katalog für den globalen Audio-Player und die Musik-Seite.
 *
 * TODO(kunde): Echte Aufnahmen bitte als .mp3/.m4a unter `/public/audio/`
 * ablegen und hier in `src` verlinken (z. B. `/audio/peaktime-halay-arabesk.mp3`).
 * Cover-Bilder analog unter `/public/images/` (Kandidaten liegen bereits unverlinkt
 * in `public/images/legacy/`, sobald Originaldateien vom Kunden vorliegen).
 * Solange `src` (bzw. `coverSrc`) `null` ist, rendert der Player bewusst einen
 * "Demnächst verfügbar"-Zustand statt eines kaputten Players — niemals einen
 * <audio>-Tag mit leerer/kaputter Quelle.
 *
 * Genres orientieren sich am tatsächlichen Repertoire für deutsch-türkische,
 * türkische und multikulturelle Hochzeiten (siehe .claude/BRAND-FACTS.md):
 * `halay` und `arabesk` sind das Vokabular der Zielgruppe selbst, kein Jargon.
 * `live` markiert Sets, in denen Saz/Gitarre live gespielt werden.
 */

export type MixMoment = 'reception' | 'dinner' | 'firstdance' | 'peaktime' | 'afterhours';

export type MixGenre =
  | 'international'
  | 'turkish'
  | 'german'
  | 'house'
  | 'classics'
  | 'live'
  | 'arabesk'
  | 'halay';

export interface Mix {
  /** Stabile, sprachunabhängige ID — wird u. a. als React-Key und Queue-Referenz genutzt. */
  id: string;
  /** Der eigene Set-Titel des Künstlers — wird nicht übersetzt. */
  title: string;
  moment: MixMoment;
  genres: MixGenre[];
  durationSec: number | null;
  bpm: number | null;
  /** Lokale Datei unter /public/audio, oder null solange der Kunde sie noch nicht geliefert hat. */
  src: string | null;
  /** Optionale Plattform-Permalinks für die Facade-Embeds auf der Musik-Seite. */
  external?: {
    spotify?: string;
    soundcloud?: string;
    mixcloud?: string;
    youtube?: string;
  };
  coverSrc: string | null;
}

export const mixes: Mix[] = [
  {
    id: 'empfang-akustik-saz',
    title: 'Akustik Empfang – Saz & Gitarre',
    moment: 'reception',
    genres: ['live', 'international'],
    durationSec: 2400,
    bpm: null,
    src: null,
    coverSrc: null,
  },
  {
    id: 'dinner-lounge-mix',
    title: 'Dinner Lounge Mix',
    moment: 'dinner',
    genres: ['international', 'classics'],
    durationSec: 3600,
    bpm: 92,
    src: null,
    coverSrc: null,
  },
  {
    id: 'eroeffnungstanz-first-dance-picks',
    title: 'First Dance Picks',
    moment: 'firstdance',
    genres: ['international', 'classics'],
    durationSec: 900,
    bpm: 78,
    src: null,
    coverSrc: null,
  },
  {
    id: 'peaktime-halay-arabesk',
    title: 'Halay & Arabesk Peaktime',
    moment: 'peaktime',
    genres: ['turkish', 'halay', 'arabesk'],
    durationSec: 2700,
    bpm: 132,
    src: null,
    coverSrc: null,
  },
  {
    id: 'peaktime-international-house',
    title: 'International Peaktime',
    moment: 'peaktime',
    genres: ['international', 'house'],
    durationSec: 3600,
    bpm: 126,
    src: null,
    coverSrc: null,
  },
  {
    id: 'afterhours-deep-cuts',
    title: 'After Hours Deep Cuts',
    moment: 'afterhours',
    genres: ['house'],
    durationSec: 4200,
    bpm: 122,
    src: null,
    coverSrc: null,
  },
];
