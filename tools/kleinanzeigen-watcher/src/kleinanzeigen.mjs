// Abruf und Auswertung einer Kleinanzeigen-Suchergebnisseite.
//
// Die Seite liefert dieselben Anzeigen in zwei Formen aus. Bevorzugt wird das
// JSON, das die Astro-Insel `resultAds` als `props`-Attribut mitbringt: dort
// stehen Preis, Ort, Datum und die Kennzeichnung bezahlter Top-Anzeigen bereits
// strukturiert. Faellt dieses Format weg, greift ein Parser auf die
// `<article data-adid data-href>`-Elemente zurueck. Der liefert weniger Felder,
// aber die ID und die URL — und nur die entscheiden ueber "neu oder nicht".

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const BASE = 'https://www.kleinanzeigen.de';

/**
 * Rechnet `sortingDate` in einen Zeitpunkt um.
 *
 * Die Seite schreibt "Heute, 14:34", "Gestern, 09:12" oder "18.08.2026". Die
 * Uhrzeit ist minutengenau — das reicht, um die eigentliche Frage zu
 * beantworten: lag die Anzeige schon eine Weile herum, als der Watcher sie
 * fand, oder war er innerhalb einer Minute dran? Ohne diese Zahl bleibt beim
 * Tempo nur Raten, und dann dreht man am falschen Knopf.
 *
 * Gibt null zurueck, wenn nichts Brauchbares dasteht — ein reines Datum ohne
 * Uhrzeit ist fuer diese Frage wertlos.
 */
export function parsePostedAt(raw, now = new Date()) {
  const text = String(raw ?? '').trim();
  const match = text.match(/^(Heute|Gestern),\s*(\d{1,2}):(\d{2})$/i);
  if (!match) return null;

  const [, tag, stunde, minute] = match;
  const d = new Date(now);
  d.setHours(Number(stunde), Number(minute), 0, 0);
  if (/gestern/i.test(tag)) d.setDate(d.getDate() - 1);

  // Kurz nach Mitternacht kann "Heute, 23:58" von gestern stammen. Ein
  // Zeitpunkt in der Zukunft ist immer ein solcher Ueberlauf.
  if (d.getTime() > now.getTime() + 60_000) d.setDate(d.getDate() - 1);
  return d.getTime();
}

/** Fehler, der ein wahrscheinliches Rate-Limit vom Netzwerkfehler trennt. */
export class BlockedError extends Error {
  constructor(status) {
    super(`Kleinanzeigen hat mit HTTP ${status} geantwortet`);
    this.name = 'BlockedError';
    this.status = status;
  }
}

/**
 * Ergaenzt die Sortierung nach Datum. Ohne sie sortiert Kleinanzeigen nach
 * Relevanz, und eine frische Anzeige kann auf Seite 3 landen — wo dieser
 * Watcher sie nie sieht.
 */
export function normalizeSearchUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.hostname !== 'www.kleinanzeigen.de' && url.hostname !== 'kleinanzeigen.de') {
    throw new Error(`Keine Kleinanzeigen-URL: ${rawUrl}`);
  }
  url.hostname = 'www.kleinanzeigen.de';
  url.protocol = 'https:';
  if (!url.searchParams.has('sortingField')) {
    url.searchParams.set('sortingField', 'SORTING_DATE');
  }
  return url.toString();
}

async function fetchHtml(url, { timeoutMs, userAgent }) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'User-Agent': userAgent || UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });
  if (!res.ok) throw new BlockedError(res.status);
  return res.text();
}

function decodeHtmlEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Astro serialisiert jeden Wert als `[typTag, wert]`. Diese Huelle wird hier
 * rekursiv abgetragen, damit ein normales Objekt uebrig bleibt.
 */
function unwrapAstro(node) {
  if (Array.isArray(node) && node.length === 2 && typeof node[0] === 'number') {
    const value = node[1];
    if (Array.isArray(value)) return value.map(unwrapAstro);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, unwrapAstro(v)]));
    }
    return value;
  }
  return node;
}

function parseFromAstroIsland(html) {
  const match = html.match(/<astro-island[^>]*\sprops="([^"]*resultAds[^"]*)"/);
  if (!match) return null;

  let decoded;
  try {
    decoded = unwrapAstro(JSON.parse(decodeHtmlEntities(match[1])).resultAds);
  } catch {
    return null;
  }
  if (!Array.isArray(decoded)) return null;

  const ads = decoded
    .map((entry) => entry?.organicAdPreview)
    .filter((ad) => ad && ad.id != null && ad.seoLink)
    .map((ad) => ({
      id: String(ad.id),
      title: String(ad.title ?? '').trim(),
      url: new URL(ad.seoLink, BASE).toString(),
      price: String(ad.price ?? '').trim(),
      location: [ad.locationName, ad.parentLocationName].filter(Boolean).join(', '),
      postedAt: String(ad.sortingDate ?? '').trim(),
      postedAtMs: parsePostedAt(ad.sortingDate),
      // `topAd` sind bezahlte Platzierungen. Sie stehen dauerhaft oben und sind
      // in aller Regel alt — fuer "wer schreibt zuerst" also wertlos.
      isTopAd: Boolean(ad.topAd),
      isCommercial: ad.posterType === 'COMMERCIAL' || Boolean(ad.hasStore),
      shipping: Boolean(ad.shippingAvailableValue),
    }));

  return ads.length > 0 ? ads : null;
}

function parseFromArticles(html) {
  const ads = [];
  const seen = new Set();
  const re = /<article[^>]*\sdata-adid="(\d+)"[^>]*\sdata-href="([^"]+)"([\s\S]*?)<\/article>/g;

  for (const [, id, href, body] of html.matchAll(re)) {
    if (seen.has(id)) continue;
    seen.add(id);

    // Der Titel steht sowohl in der <h3> als auch im ld+json-Block der Anzeige.
    // Die <h3> ist die kuerzere Quelle, das JSON der Fallback.
    let title = body.match(/<h3[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '';
    if (!title) {
      const ld = body.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/)?.[1];
      if (ld) {
        try {
          title = JSON.parse(ld).title ?? '';
        } catch {
          // Kein verwertbares ld+json — der Titel bleibt leer.
        }
      }
    }
    title = decodeHtmlEntities(title.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

    const price = decodeHtmlEntities(
      body.match(/>([^<>]*(?:\d[\d.]*\s*€[^<>]*|Zu verschenken))</)?.[1] ?? '',
    ).trim();
    const location = decodeHtmlEntities(
      body.match(/locationOutline[\s\S]*?<span>([^<]+)<\/span>/)?.[1] ?? '',
    ).trim();

    ads.push({
      id,
      title,
      url: new URL(href, BASE).toString(),
      price,
      location,
      postedAt: '',
      postedAtMs: null,
      isTopAd: false,
      isCommercial: /class="[^"]*bg-accent[^"]*">PRO</.test(body),
      shipping: body.includes('data-dhl-promotion'),
    });
  }
  return ads;
}

/** Laedt eine Suchseite und gibt die Anzeigen in Seitenreihenfolge zurueck. */
export async function fetchAds(searchUrl, options = {}) {
  const { timeoutMs = 20_000, userAgent } = options;
  const html = await fetchHtml(searchUrl, { timeoutMs, userAgent });

  const ads = parseFromAstroIsland(html) ?? parseFromArticles(html);
  if (ads.length === 0) {
    // Eine leere Trefferliste ist legitim; ein kaputter Parser sieht aber
    // genauso aus. Die Captcha-Seite ist der haeufigste Grund und wird hier
    // vom echten Nulltreffer getrennt.
    if (/captcha|Zugriff verweigert|access denied/i.test(html)) {
      throw new BlockedError(200);
    }
  }
  return ads;
}
