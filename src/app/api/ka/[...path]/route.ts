/**
 * GET /api/ka/<slug>/<id> — Brücke vom Kleinanzeigen-Watcher in die
 * Kleinanzeigen-App auf dem iPhone.
 *
 * Warum es diese Route gibt, obwohl sie mit der Website nichts zu tun hat:
 *
 * Der Watcher (tools/kleinanzeigen-watcher) meldet neue Anzeigen per Telegram.
 * Ein Tipp auf den Link soll die Anzeige in der Kleinanzeigen-App öffnen, nicht
 * im Browser. Das geht mit einem gewöhnlichen https-Link nicht: Telegram lädt
 * ihn über `[WKWebView loadRequest:]`, und WebKit setzt für diesen Pfad
 * `ShouldAllowExternalSchemesButNotAppLinks` (WebPageProxy.cpp) — die iOS
 * Universal Links von kleinanzeigen.de sind für diesen Ladevorgang also per
 * Definition abgeschaltet. Ein `ebayk://`-Link direkt in der Nachricht scheidet
 * ebenfalls aus: die Bot-API nimmt ihn an, aber der iOS-Client macht daraus
 * keinen antippbaren Link (auf dem Gerät nachgeprüft).
 *
 * Was funktioniert, ist der Umweg über eine eigene Seite. Telegrams eingebauter
 * Browser bricht in `BrowserWebContent.swift` jede Navigation ab, deren Schema
 * nicht in `["http","https","tonsite","about"]` steht, und reicht sie per
 * `openExternalUrl(…, forceExternal: true)` an `UIApplication.shared.open()`
 * weiter. Genau das löst diese Seite aus, indem sie sofort auf `ebayk://`
 * navigiert.
 *
 * Die Seite ist bewusst dreistufig, weil die erste Stufe nicht überall zündet:
 *   1. Sofortige Navigation im <head> — null Taps, wenn sie greift.
 *   2. Bildschirmfüllender `ebayk://`-Anker — ein echter Tap ist eine
 *      Nutzergeste und damit der zuverlässigste Weg (Apples Safari-Regel
 *      verlangt für App-Starts genau die).
 *   3. Kleiner https-Link — führt notfalls in den Browser und ist der einzige
 *      Weg, der auch ohne installierte App irgendwo landet.
 *
 * Liegt unter /api/, und das ist kein Zufall: `src/proxy.ts` nimmt `api` von der
 * Locale-Umschreibung aus, und `robots.ts` sperrt `/api/` fürs Crawling. Beides
 * gilt damit ohne eine einzige Änderung an diesen Dateien.
 */

import { NextResponse } from 'next/server';

const AD_BASE = 'https://www.kleinanzeigen.de/s-anzeige';
const APP_BASE = 'ebayk://s-anzeige';

/**
 * Die Route darf ausschliesslich auf Kleinanzeigen-Anzeigen zeigen. Ohne diese
 * Prüfung wäre sie ein offener Redirect auf der Domain des Kunden — man könnte
 * `…/api/ka/<beliebiges>` verschicken und die Adresszeile würde dj-veys.de
 * zeigen. Deshalb Positivliste statt Filter: nur genau die zwei Segmente einer
 * Anzeigen-URL, jeweils gegen ein enges Muster.
 */
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,199})$/i;
const AD_ID = /^\d{1,20}(?:-\d{1,10}){0,4}$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Für die Einbettung in ein <script>: begrenzt auf das, was die Muster oben zulassen. */
function escapeJs(value: string): string {
  return value.replace(/[\\'"<>]/g, '');
}

function page(slug: string, id: string, title: string | null): string {
  const appUrl = `${APP_BASE}/${slug}/${id}`;
  const webUrl = `${AD_BASE}/${slug}/${id}`;
  const heading = title ? escapeHtml(title) : 'Anzeige öffnen';

  // Kein setTimeout und kein iframe: Apple lässt App-Starts nur aus dem
  // Hauptdokument und nicht aus Timern zu (Safari 9.0 Release Notes).
  //
  // Das Script steht am ENDE des <body>, nicht im <head>. Im <head> hängt der
  // Sprungversuch die Seite in einer schwebenden Navigation auf, bevor
  // überhaupt etwas gezeichnet wurde — nachgemessen: die Seite rendert dann
  // gar nicht. Auf einem Gerät ohne installierte App wäre das Ergebnis ein
  // leerer Bildschirm statt des Rückfall-Buttons. Am Ende des <body> ist das
  // Markup bereits da; scheitert der Sprung, steht der Button sofort bereit.
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${heading}</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; font:16px/1.5 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;
         display:flex; flex-direction:column; min-height:100vh; }
  .tap { flex:1; display:flex; flex-direction:column; align-items:center;
         justify-content:center; gap:.75rem; padding:2rem 1.5rem; text-align:center;
         text-decoration:none; color:inherit; }
  .tap strong { font-size:1.35rem; }
  .badge { display:inline-block; padding:.7rem 1.4rem; border-radius:999px;
           background:#1b74e4; color:#fff; font-weight:600; }
  .alt { padding:1.5rem; text-align:center; }
  .alt a { color:#1b74e4; }
</style>
</head>
<body>
<a class="tap" href="${escapeHtml(appUrl)}">
  <strong>${heading}</strong>
  <span class="badge">In der Kleinanzeigen-App öffnen</span>
  <span>Tippe, falls die App nicht von selbst aufgeht.</span>
</a>
<p class="alt"><a href="${escapeHtml(webUrl)}">Stattdessen im Browser ansehen</a></p>
<script>window.location.href = "${escapeJs(appUrl)}";</script>
</body>
</html>`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const [slug, id] = path ?? [];

  if (!slug || !id || path.length !== 2 || !SLUG.test(slug) || !AD_ID.test(id)) {
    return NextResponse.json(
      { error: 'Erwartet wird /api/ka/<slug>/<anzeigen-id>.' },
      { status: 400 },
    );
  }

  // Nur zur Anzeige in der Überschrift; der Titel beeinflusst kein Ziel.
  const title = new URL(request.url).searchParams.get('t');

  return new NextResponse(page(slug, id, title?.slice(0, 120) ?? null), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Ohne no-store zeigt Telegrams WebView beim zweiten Aufruf womöglich die
      // Seite aus dem Cache, ohne das Script erneut auszuführen — dann bleibt
      // der Sprung in die App aus.
      'cache-control': 'no-store, must-revalidate',
      'referrer-policy': 'no-referrer',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}
