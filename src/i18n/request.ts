import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { applyTextOverrides, getTextOverrides } from '@/lib/text-overrides';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const base = (await import(`../../messages/${locale}.json`)).default;
  // Von Hand korrigierte Texte (Adminpanel / Knopf „Texte" auf der Seite)
  // liegen als Schicht über der JSON-Datei — siehe src/lib/text-overrides.ts.
  const messages = applyTextOverrides(base, await getTextOverrides(locale));

  return {
    locale,
    messages,
    timeZone: 'Europe/Berlin',
  };
});
