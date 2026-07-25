import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely, resolving conflicting utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Locale-aware date formatting. Accepts a Date or an ISO-ish string so callers
 * (server or client components) don't need to construct a Date first.
 */
export function formatDate(
  date: Date | string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
) {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(value);
}

/**
 * Resolve a locale-keyed content field (e.g. `site.tagline`) that may not yet
 * cover every routing locale — content modules get translated incrementally,
 * so `ku`/`fr`/`es` can lag behind while `de`/`en`/`tr` are filled in. Falls
 * back to German, then to whatever value exists, rather than rendering
 * `undefined`.
 */
export function localized<T extends Record<string, string>>(
  dict: T,
  locale: string,
  fallback: keyof T = 'de' as keyof T
): string {
  return dict[locale as keyof T] ?? dict[fallback] ?? Object.values(dict)[0] ?? '';
}
