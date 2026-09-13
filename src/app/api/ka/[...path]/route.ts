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
 * weiter. Genau das löst diese Seite aus, indem sie auf `ebayk://` navigiert.
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

/** Deckel gegen aufgeblähte Links; eine Erstnachricht ist zwei Sätze lang. */
const MAX_MESSAGE = 600;
const MAX_TITLE = 120;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Einbettung in ein <script>. `JSON.stringify` allein genügt nicht: es lässt
 * `<` und `>` unangetastet, und ein `</script>` im Text würde das Element
 * schliessen und den Rest als Markup ausliefern.
 */
function toJsString(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function page(slug: string, id: string, title: string | null, message: string | null): string {
  const appUrl = `${APP_BASE}/${slug}/${id}`;
  const webUrl = `${AD_BASE}/${slug}/${id}`;
  const heading = title ? escapeHtml(title) : 'Anzeige öffnen';

  // Mit Vorlage wird NICHT automatisch gesprungen. Das Kopieren in die
  // Zwischenablage verlangt eine Nutzergeste — ein Sprung beim Laden hätte
  // keine, und man landete in der App mit leerer Zwischenablage. Ein Tipp
  // erledigt dann beides: kopieren und öffnen.
  const auto = message ? '' : `<script>window.location.href = ${toJsString(appUrl)};</script>`;

  const hint = message
    ? 'Tippen: Text kopieren und App öffnen'
    : 'Tippe, falls die App nicht von selbst aufgeht.';

  const preview = message
    ? `<p class="msg">${escapeHtml(message)}</p>
<p class="note" id="done" hidden>Text kopiert — in der App ins Nachrichtenfeld tippen und einsetzen.</p>`
    : '';

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
         text-decoration:none; color:inherit; -webkit-tap-highlight-color:transparent; }
  .tap strong { font-size:1.35rem; }
  .badge { display:inline-block; padding:.7rem 1.4rem; border-radius:999px;
           background:#1b74e4; color:#fff; font-weight:600; }
  .msg { max-width:34rem; margin:.5rem 0 0; padding:.9rem 1.1rem; border-radius:.9rem;
         background:color-mix(in srgb, currentColor 8%, transparent); text-align:left;
         white-space:pre-wrap; font-size:.95rem; }
  .note { font-size:.9rem; opacity:.75; }
  .alt { padding:1.5rem; text-align:center; }
  .alt a { color:#1b74e4; }
</style>
</head>
<body>
<a class="tap" id="go" href="${escapeHtml(appUrl)}">
  <strong>${heading}</strong>
  <span class="badge">In der Kleinanzeigen-App öffnen</span>
  <span class="note">${hint}</span>
  ${preview}
</a>
<p class="alt"><a href="${escapeHtml(webUrl)}">Stattdessen im Browser ansehen</a></p>
${auto}
<script>
(function () {
  var text = ${message ? toJsString(message) : 'null'};
  if (!text) return;

  // Synchron kopieren, nicht per navigator.clipboard: dessen Promise löst erst
  // nach dem Tap-Handler auf, und die Navigation in die App bricht es ab. Der
  // Textarea-Weg läuft vollständig innerhalb der Nutzergeste durch.
  function copy(value) {
    var ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    var ok = false;
    try {
      // iOS ignoriert select() auf einem readonly-Feld; der Umweg über eine
      // Range ist dort der einzige, der die Auswahl wirklich setzt.
      ta.contentEditable = 'true';
      ta.readOnly = false;
      var range = document.createRange();
      range.selectNodeContents(ta);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      ta.setSelectionRange(0, value.length);
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  document.getElementById('go').addEventListener('click', function () {
    var ok = copy(text);

    // Zweiter Versuch ueber die moderne API. Sie ist asynchron und kann von der
    // gleich folgenden Navigation abgebrochen werden — deshalb nicht als
    // Hauptweg, aber als Rueckfall kostenlos: wo execCommand nicht mehr
    // unterstuetzt wird, greift sie, und umgekehrt.
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          ok = true;
        }, function () {});
      }
    } catch (e) {
      // Kein Zugriff auf die Zwischenablage — der Text steht sichtbar auf der
      // Seite und laesst sich von Hand markieren.
    }

    if (ok) {
      var done = document.getElementById('done');
      if (done) done.hidden = false;
    }
    // Kein preventDefault: der Anker navigiert von selbst weiter, und genau
    // diese Navigation ist es, die Telegram an das Betriebssystem abgibt.
  });
})();
</script>
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

  // Beide sind reiner Anzeigetext und beeinflussen kein Sprungziel.
  const query = new URL(request.url).searchParams;
  const title = query.get('t')?.slice(0, MAX_TITLE) ?? null;
  const message = query.get('m')?.slice(0, MAX_MESSAGE) ?? null;

  return new NextResponse(page(slug, id, title, message), {
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
