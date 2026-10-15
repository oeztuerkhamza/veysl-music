/**
 * URL slug from a free-text name — ASCII only, lowercase, hyphen-separated.
 *
 * Standalone and import-free for the same reason `iso-date.ts` is: collections
 * are loaded by the Payload CLI without the `@/` aliases.
 *
 * German umlauts and `ß` are spelled out (`ü` → `ue`) rather than stripped to
 * their base letter, because that is how a German speaker types the name into
 * a search box and how the rest of this site's slugs are written
 * (`schwaebisch-gmuend`, `boeblingen`). Turkish letters (`ş ğ ı ç ö ü İ`) lose
 * their marks like every other Turkish slug on the site (`gurultu`).
 */
export function slugify(input: string): string {
  return input
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' und ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
