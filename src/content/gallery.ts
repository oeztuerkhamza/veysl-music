/**
 * Kuratierte Auswahl aus der Kundenlieferung vom 02.08.2026 — die erste, die
 * überhaupt echtes Material enthielt (public/images/legacy/ hatte keines,
 * siehe .claude/BRAND-FACTS.md; das Stockfoto 05-86ab7620.jpg bleibt gesperrt
 * und zeigt nicht Veysel).
 *
 * Bewusst acht Bilder statt aller dreißig, und bewusst alle im Verhältnis 3:2:
 * `GalleryGrid` rendert mit `object-cover` in einer Rasterzeile gleicher Höhe.
 * Gemischte Seitenverhältnisse würden dort ein zweites Mal beschnitten — und
 * zwar an der Kante, nicht am Motiv, also mitten durch Gesichter. Ein Format
 * für das ganze Raster ist die einzige Variante, die ohne Nachdenken pro Bild
 * funktioniert. Die Dateien sind bereits auf 3:2 vorgeschnitten (siehe
 * public/images/veys/), der Grid-Zuschnitt ist damit ein Nulloperation.
 *
 * NOCH NICHT hier, und das ist kein Versehen:
 * - **Video / Aftermovie.** `type: 'video'` funktioniert unverändert, sobald
 *   eine Datei existiert — geliefert wurde keine.
 * - **Das Brautpaar-Foto.** Beide Gesichter klar erkennbar, keine schriftliche
 *   Einwilligung. Ohne die darf es nicht online (DSGVO / Recht am eigenen
 *   Bild) — siehe die Checkliste in FOTO-LISTESI.md.
 * - **Volle Tanzfläche.** Existiert in der Lieferung nicht. Die Galerie zeigt
 *   deshalb ehrlich, was da ist: Aufbau, Technik, Live-Besetzung, Moderation,
 *   Locations. Kein Bild suggeriert eine Feier, die nicht fotografiert wurde.
 */

export type GalleryMediaType = 'photo' | 'video';

export interface GalleryItem {
  id: string;
  type: GalleryMediaType;
  eventType?: 'wedding' | 'engagement' | 'afterparty' | 'corporate';
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Nur für type "video": externe Quelle, die per Klick-Fassade nachgeladen wird. */
  videoUrl?: string;
}

export const gallery: GalleryItem[] = [
  {
    id: 'moderation-live-band',
    type: 'photo',
    eventType: 'wedding',
    src: '/images/veys/moderation-live-band-3x2.jpg',
    alt: 'Veysel Durmuş moderiert mit Mikrofon, Live-Musiker mit Klarinette im Hintergrund',
    width: 2400,
    height: 1600,
  },
  {
    id: 'buehne-orchester',
    type: 'photo',
    eventType: 'wedding',
    src: '/images/veys/buehne-orchester-3x2.jpg',
    alt: 'Live-Besetzung mit Klarinette, Davul und Keyboards neben dem DJ-Setup auf der Bühne',
    width: 1599,
    height: 1066,
  },
  {
    id: 'location-abendstimmung',
    type: 'photo',
    eventType: 'wedding',
    src: '/images/veys/location-abendstimmung-3x2.jpg',
    alt: 'Hochzeitssaal am Abend: eingedeckte Tafeln und Blumenbogen im violetten Licht, Veysel Durmuş am DJ-Pult im Vordergrund',
    width: 1536,
    height: 1024,
  },
  {
    id: 'saal-signature',
    type: 'photo',
    eventType: 'wedding',
    src: '/images/veys/saal-signature-3x2.jpg',
    alt: 'Veysel Durmuş am DJ-Pult in einem großen Festsaal mit Kronleuchtern und eingedeckten Tischen',
    width: 1536,
    height: 1024,
  },
  {
    id: 'setup-licht',
    type: 'photo',
    eventType: 'afterparty',
    src: '/images/veys/setup-licht-3x2.jpg',
    alt: 'Beleuchtetes DJ-Pult im Bodennebel, farbige Lichteffekte an der Wand dahinter',
    width: 1312,
    height: 875,
  },
  {
    id: 'saz-detail',
    type: 'photo',
    src: '/images/veys/saz-detail-3x2.jpg',
    alt: 'Hände von Veysel Durmuş beim Spielen einer Bağlama (Saz)',
    width: 1600,
    height: 1067,
  },
  {
    id: 'dj-controller',
    type: 'photo',
    src: '/images/veys/dj-controller-3x2.jpg',
    alt: 'Hände am DJ-Controller, Nahaufnahme der beleuchteten Bedienelemente',
    width: 2400,
    height: 1600,
  },
  {
    id: 'setup-soundcheck',
    type: 'photo',
    src: '/images/veys/setup-soundcheck-3x2.jpg',
    alt: 'Aufgebaute Technik vor der Veranstaltung: DJ-Pult, Lautsprecher und Lichtstative im Saal',
    width: 1399,
    height: 933,
  },
];
