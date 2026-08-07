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
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

/** Payloads Session-Cookie. Steht `httpOnly` und ist für JavaScript unsichtbar — genau deshalb braucht es den Hinweis unten. */
const PAYLOAD_SESSION_COOKIE = 'payload-token';

/**
 * Lesbarer Hinweis „hier sitzt vermutlich jemand mit Adminsitzung".
 *
 * Warum überhaupt: Jede Seite dieses Projekts ist statisch vorgerendert. Das
 * ausgelieferte HTML ist für alle identisch, der Server weiß beim Rendern
 * nichts von einer Sitzung — und das soll auch so bleiben, sonst wären alle
 * Seiten dynamisch und die halbierte JavaScript-Last wäre wieder dahin.
 *
 * Die Bearbeitungsschicht muss die Entscheidung also im Browser treffen. Sie
 * darf dafür aber nicht bei jedem Aufruf `/api/users/me` anfragen — das wäre
 * eine Anfrage pro Besuch für ein Feature, das eine einzige Person benutzt.
 * Dieser Hinweis kostet stattdessen nichts: Er entsteht nur, wenn ohnehin ein
 * Payload-Cookie mitkommt.
 *
 * ⚠️ Er ist ein *Hinweis*, keine Berechtigung. Er ist absichtlich fälschbar —
 * wer ihn selbst setzt, bekommt eine Oberfläche, deren Aufrufe allesamt an
 * Payloads `isAdmin`-Zugriffsregeln scheitern. Die Autorität liegt beim
 * `httpOnly`-Token und der serverseitigen Prüfung, nie hier.
 */
const ADMIN_HINT_COOKIE = 'dj-cms-hint';

export default function proxy(request: NextRequest) {
  /**
   * Kanonisierung der Schrägstrich-Variante — von Hand, weil Next sie hier
   * nicht mehr selbst übernimmt.
   *
   * `skipTrailingSlashRedirect: true` in next.config.ts schaltet Nexts
   * eingebauten 308 ab. Das ist dort begründet und muss so bleiben (ohne die
   * Option dreht sich der Standalone-Server bei jeder lokalisierten Route in
   * eine Endlosweiterleitung), nur: Ersatz gab es keinen. `/pakete/` und
   * `/tr/dugun-dj/karlsruhe/` lieferten damit dieselbe Seite unter einer
   * zweiten URL aus — genau die Duplikat-Situation, gegen die die Seite sonst
   * überall kanonische URLs setzt.
   *
   * ⚠️ `new URL(request.url)`, NICHT `request.nextUrl.clone()`. `NextURL`
   * merkt sich beim Parsen ein `trailingSlash`-Flag, und der `pathname`-Setter
   * löscht es nicht: `toString()` hängt den Schrägstrich anschließend wieder
   * an. Das Ziel wäre damit Byte für Byte die angefragte URL — aus der
   * Kanonisierung würde eine Endlosweiterleitung, und zwar für jede URL mit
   * Schrägstrich am Ende. (Genau so war diese Stelle zuerst gebaut; ein
   * 308-Status allein beweist nichts, geprüft werden muss der
   * `Location`-Wert.)
   *
   * `replace(/\/+$/, '')` statt `slice(0, -1)`: mehrere Schrägstriche am Ende
   * fallen in einem Schritt weg statt in mehreren Weiterleitungen. Die Wurzel
   * („/", Länge 1) ist ausgenommen — sie IST die kanonische Form.
   */
  const { pathname } = request.nextUrl;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const url = new URL(request.url);
    url.pathname = pathname.replace(/\/+$/, '') || '/';
    return NextResponse.redirect(url, 308);
  }

  const response = handleI18n(request);

  const hasSession = request.cookies.has(PAYLOAD_SESSION_COOKIE);
  const hasHint = request.cookies.has(ADMIN_HINT_COOKIE);

  if (hasSession && !hasHint) {
    response.cookies.set(ADMIN_HINT_COOKIE, '1', {
      httpOnly: false, // muss für JavaScript lesbar sein — das ist der ganze Zweck
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
  } else if (!hasSession && hasHint) {
    // Abgemeldet: Hinweis wieder wegnehmen, damit die Oberfläche nicht als
    // Karteileiche stehen bleibt und ihre Aufrufe ins Leere laufen.
    response.cookies.delete(ADMIN_HINT_COOKIE);
  }

  return response;
}

export const config = {
  // Alles außer API-Routen, dem Payload-Adminpanel (/admin, src/app/(payload)/**
  // — bewusst außerhalb von [locale], kein Sprachpräfix), Next-Internals und
  // Dateien mit Endung.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
