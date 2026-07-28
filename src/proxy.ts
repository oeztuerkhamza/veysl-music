/**
 * Heißt `proxy.ts`, nicht `middleware.ts`: seit Next.js 16 ist Middleware in
 * Proxy umbenannt (identische Funktionsweise, siehe
 * `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`). Unter
 * dem alten Namen lief die Datei zwar weiter, warnte aber bei jedem Start —
 * und eine Deprecation-Warnung, die man täglich wegliest, verdeckt
 * irgendwann eine echte.
 *
 * Der Import bleibt `next-intl/middleware`: das ist der Paketpfad von
 * next-intl, nicht die Next.js-Konvention, und der wurde nicht umbenannt.
 */
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Alles außer API-Routen, dem Payload-Adminpanel (/admin, src/app/(payload)/**
  // — bewusst außerhalb von [locale], kein Sprachpräfix), Next-Internals und
  // Dateien mit Endung.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
