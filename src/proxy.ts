import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Alles außer API-Routen, dem Payload-Adminpanel (/admin, src/app/(payload)/**
  // — bewusst außerhalb von [locale], kein Sprachpräfix), Next-Internals und
  // Dateien mit Endung.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
