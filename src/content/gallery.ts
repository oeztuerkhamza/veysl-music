/**
 * TODO(kunde): Freigegebenes Foto-/Videomaterial für die öffentliche Galerie
 * fehlt noch. Das bestehende Material in public/images/legacy/ ist laut
 * .claude/BRAND-FACTS.md unkuratiertes Web-Export-Material der alten Seite —
 * u. a. ein Stockfoto, das nicht Veysel zeigt (05-86ab7620.jpg) und darf
 * NIRGENDS verwendet werden. Keines der 12 Fotos zeigt eine echte Hochzeit
 * (kein Paar, keine Tanzfläche, keine Location). Diese Liste bleibt deshalb
 * bewusst leer, bis professionelle Fotos/Video von echten Hochzeiten und ein
 * Aftermovie vorliegen. Die Galerie-Seite rendert währenddessen einen
 * gestalteten Leerzustand (gallery.empty) statt einer schwachen Bildauswahl.
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

export const gallery: GalleryItem[] = [];
