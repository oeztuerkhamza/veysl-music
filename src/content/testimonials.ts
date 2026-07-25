/**
 * TODO(kunde): Es liegen noch keine verifizierten, freigegebenen Stimmen von
 * Paaren oder Planer:innen vor (siehe .claude/BRAND-FACTS.md — "Still unknown
 * — do NOT invent"). NICHT mit erfundenen Namen/Zitaten befüllen. Leer
 * lassen, bis echte Referenzen vom Kunden freigegeben werden; die
 * konsumierende Seite (Homepage) rendert in der Zwischenzeit einen
 * gestalteten Leerzustand statt dieser Liste.
 */

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  role?: string;
  eventType?: 'wedding' | 'engagement' | 'afterparty' | 'corporate';
  venue?: string;
  year?: number;
  avatar?: { src: string; alt: string; width: number; height: number };
}

export const testimonials: Testimonial[] = [];
