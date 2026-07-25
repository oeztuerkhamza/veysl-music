/**
 * Small, self-contained inline brand marks for social/contact links.
 *
 * Hand-drawn (not traced from any icon package or vendor asset) — this
 * exists because the installed `lucide-react` version ships no brand/logo
 * icons at all (Instagram, YouTube, etc. were removed upstream). Every icon
 * here is a single component, 24x24 viewBox, monochrome (`fill="currentColor"`,
 * inherited by children), decorative by default (`aria-hidden`, `focusable
 * ="false"`) — always pair with a visible label or an `aria-label` on the
 * wrapping link/button.
 *
 * Exports: `InstagramIcon`, `YouTubeIcon`, `WhatsAppIcon`, `TikTokIcon`,
 * `SpotifyIcon`. Import from `@/components/ui/social-icons` — do not reach
 * for `lucide-react` for brand marks, it doesn't have them.
 */

export interface SocialIconProps {
  className?: string;
}

/** Simplified Instagram glyph: rounded frame, circular lens, corner dot. */
export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 2H17A5 5 0 0 1 22 7V17A5 5 0 0 1 17 22H7A5 5 0 0 1 2 17V7A5 5 0 0 1 7 2Z
           M7.2 4.2H16.8A3 3 0 0 1 19.8 7.2V16.8A3 3 0 0 1 16.8 19.8H7.2A3 3 0 0 1 4.2 16.8V7.2A3 3 0 0 1 7.2 4.2Z
           M7 12A5 5 0 1 0 17 12A5 5 0 1 0 7 12Z
           M8.8 12A3.2 3.2 0 1 0 15.2 12A3.2 3.2 0 1 0 8.8 12Z
           M16.3 6.5A1.2 1.2 0 1 0 18.7 6.5A1.2 1.2 0 1 0 16.3 6.5Z"
      />
    </svg>
  );
}

/** Simplified YouTube glyph: rounded frame with a cut-out play triangle. */
export function YouTubeIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 5H18A4 4 0 0 1 22 9V15A4 4 0 0 1 18 19H6A4 4 0 0 1 2 15V9A4 4 0 0 1 6 5Z
           M10 8.7L16.2 12L10 15.3Z"
      />
    </svg>
  );
}

/** Offizielle WhatsApp-Markenfarbe. Nicht ändern — siehe Hinweis unten. */
export const WHATSAPP_GREEN = '#25D366';

/**
 * Offizielles WhatsApp-Glyph (unveränderte Originalkontur, 24×24).
 * Quelle: public/brand/whatsapp.svg
 *
 * ⚠️ Markenrechtlicher Hinweis: Das Logo ist eine eingetragene Marke von Meta.
 * Die Verwendung als Kontaktschaltfläche („schreib uns auf WhatsApp") ist
 * zulässig, solange die Kontur nicht verändert wird, keine Partnerschaft oder
 * Empfehlung suggeriert wird und — wenn farbig dargestellt — das offizielle
 * Grün #25D366 verwendet wird. Deshalb bleibt der Pfad exakt so, wie er ist.
 */
export function WhatsAppIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/** Simplified TikTok glyph: note head, stem, and a small top curl. For later use. */
export function TikTokIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <circle cx="9" cy="17" r="3.2" />
      <rect x="10.6" y="3" width="2.8" height="14" rx="1.4" />
      <path d="M13.4 3c2.7.3 4.9 2.5 5.1 5.2-2-.1-3.8-1-5.1-2.4V3Z" />
    </svg>
  );
}

/** Simplified Spotify glyph: circle with three curved sound-wave cut-outs. For later use. */
export function SpotifyIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 12A10 10 0 1 0 22 12A10 10 0 1 0 2 12Z
           M6 15.8Q12 13 18 15.8L18 17Q12 14.2 6 17Z
           M7 12.4Q12 10 17 12.4L17 13.6Q12 11.2 7 13.6Z
           M8 9.2Q12 7.2 16 9.2L16 10.4Q12 8.4 8 10.4Z"
      />
    </svg>
  );
}
