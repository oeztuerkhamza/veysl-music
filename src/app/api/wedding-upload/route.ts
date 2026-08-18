/**
 * POST /api/wedding-upload — der einzige Weg, auf dem Dateien ohne Anmeldung
 * in dieses System kommen. Entsprechend eng.
 *
 * Aufgerufen vom Formular unter `/fotos/<token>`, das ein Brautpaar per Link
 * bekommt. Die Berechtigung ist der Token selbst: er steht in keiner
 * öffentlichen Antwort (feldbezogene Leseregel auf `weddings.uploadToken`),
 * besteht aus 192 zufälligen Bit und lässt sich vom Betreiber jederzeit neu
 * vergeben, womit der verschickte Link tot ist.
 *
 * Was hier NICHT passiert: nichts von dem, was ankommt, wird veröffentlicht.
 * Alles landet als `wedding-submissions`-Datensatz im Posteingang und wird
 * erst sichtbar, wenn der Betreiber es auf `/echte-hochzeiten` übernimmt.
 * Der Grund steht ausführlich in der Collection — kurz: der Link wird
 * weitergeleitet und in Familiengruppen geteilt, und eine öffentliche
 * Referenzseite darf nicht zeigen, was dabei zurückkommt.
 *
 * Die Schreibzugriffe laufen über die Local API (`overrideAccess`), weil
 * `wedding-submissions.create` und `media.create` für jeden Weg von außen
 * geschlossen sind. Diese Route ist damit die einzige Stelle, an der die
 * Regeln stehen — sie sind kein zweites Sicherheitsnetz, sie sind das Netz.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { Media, WeddingClip } from '@payload-types';
import { getPayloadClient } from '@/lib/payload';
import { parseSocialPermalink } from '@/lib/social/permalink';
import {
  MAX_CLIPS_PER_SUBMISSION,
  MAX_CLIP_BYTES,
  MAX_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_PHOTOS_PER_SUBMISSION,
  MAX_PHOTO_BYTES,
  MAX_TOTAL_BYTES,
  MAX_YOUTUBE_URLS_PER_SUBMISSION,
  isAllowedClip,
  isAllowedPhoto,
} from '@/lib/wedding-upload';
import { getClientIp, isRateLimited } from '../_lib/rate-limit';

export const dynamic = 'force-dynamic';

/** Antwortet immer gleich, egal ob Token unbekannt, abgeschaltet oder Hochzeit gelöscht. */
function invalidToken() {
  return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 404 });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    // Zwei Fenster übereinander: das enge fängt den Dauerlauf, das weite den
    // langsamen Tropf. Großzügig genug für ein Paar, das seine Fotos in
    // mehreren Anläufen schickt, weil das Handy zwischendurch das Netz
    // verliert — das ist der Normalfall, nicht der Ausnahmefall.
    if (
      isRateLimited(`wedding-upload:${ip}`, { capacity: 12, windowMs: 10 * 60_000 }) ||
      isRateLimited(`wedding-upload-day:${ip}`, { capacity: 60, windowMs: 24 * 60 * 60_000 })
    ) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      // Auch der Fall „Datei größer als der Proxy erlaubt“ landet hier, wenn
      // nginx die Verbindung mittendrin abbricht.
      return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
    }

    const token = String(form.get('token') ?? '').trim();
    if (!token || token.length > 128) return invalidToken();

    const payload = await getPayloadClient();

    const found = await payload.find({
      collection: 'weddings',
      where: { uploadToken: { equals: token } },
      limit: 1,
      depth: 0,
      pagination: false,
    });

    const wedding = found.docs[0];
    // `uploadEnabled` bewusst mit demselben 404 wie ein unbekannter Token:
    // Wer einen abgelaufenen Link ausprobiert, soll nicht erfahren, dass es
    // ihn einmal gab.
    if (!wedding || wedding.uploadEnabled === false) return invalidToken();

    const rawName = String(form.get('submitterName') ?? '').trim();
    const rawNote = String(form.get('note') ?? '').trim();
    const submitterName = rawName.slice(0, MAX_NAME_LENGTH);
    const note = rawNote.slice(0, MAX_NOTE_LENGTH);

    const photoFiles = form.getAll('photos').filter((v): v is File => v instanceof File && v.size > 0);
    const clipFiles = form.getAll('clips').filter((v): v is File => v instanceof File && v.size > 0);
    const youtubeRaw = form
      .getAll('youtubeUrls')
      .map((v) => String(v).trim())
      .filter(Boolean);

    if (photoFiles.length > MAX_PHOTOS_PER_SUBMISSION || clipFiles.length > MAX_CLIPS_PER_SUBMISSION) {
      return NextResponse.json({ ok: false, error: 'too_many_files' }, { status: 413 });
    }

    // Summe zuerst. Jede Datei einzeln unter ihrem Limit heißt noch nicht,
    // dass die Anfrage als Ganzes tragbar ist — 30 × 20 MB wären 600 MB.
    const totalBytes = [...photoFiles, ...clipFiles].reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });
    }

    for (const file of photoFiles) {
      if (!isAllowedPhoto(file.type) || file.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ ok: false, error: 'bad_photo' }, { status: 415 });
      }
    }
    for (const file of clipFiles) {
      if (!isAllowedClip(file.type) || file.size > MAX_CLIP_BYTES) {
        return NextResponse.json({ ok: false, error: 'bad_clip' }, { status: 415 });
      }
    }

    // Nur YouTube, und normalisiert — dieselbe Funktion, die auch das
    // Videofeld der Hochzeit und die kuratierten Social-Beiträge prüfen, statt
    // einer dritten Auslegung von „ist das ein YouTube-Link“.
    const youtubeUrls: string[] = [];
    for (const raw of youtubeRaw.slice(0, MAX_YOUTUBE_URLS_PER_SUBMISSION)) {
      const parsed = parseSocialPermalink(raw);
      if (!parsed || parsed.platform !== 'youtube') {
        return NextResponse.json({ ok: false, error: 'bad_youtube' }, { status: 400 });
      }
      youtubeUrls.push(parsed.permalink);
    }

    if (photoFiles.length === 0 && clipFiles.length === 0 && youtubeUrls.length === 0 && !note) {
      return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 });
    }

    // Der Alt-Text ist in `media` Pflicht. Was hier steht, ist ein
    // Platzhalter, kein Alt-Text — niemand außer dem Betreiber weiß, was auf
    // dem Bild zu sehen ist, und geraten wäre schlimmer als vorläufig. Beim
    // Übernehmen im Editor steht pro Foto ein Feld dafür.
    const altSeed = [wedding.coupleLabel, wedding.city].filter(Boolean).join(' — ') || 'Hochzeit';

    // Die ID-Typen kommen aus den generierten Payload-Typen, nicht als
    // `string | number` von Hand: Welcher der beiden es ist, entscheidet der
    // Datenbank-Adapter (hier Zahlen), und ein Upload-Feld weist den falschen
    // Typ beim Speichern zurück.
    const photoIds: Media['id'][] = [];
    const clipIds: WeddingClip['id'][] = [];

    // Nacheinander, nicht parallel: `sharp` auf 30 Handyfotos gleichzeitig ist
    // auf einer kleinen VM der schnellste Weg an die Speichergrenze.
    for (const file of photoFiles) {
      const created = await payload.create({
        collection: 'media',
        data: { alt: altSeed },
        file: {
          data: Buffer.from(await file.arrayBuffer()),
          name: file.name,
          mimetype: file.type,
          size: file.size,
        },
      });
      photoIds.push(created.id);
    }

    for (const file of clipFiles) {
      const created = await payload.create({
        collection: 'wedding-clips',
        data: {},
        file: {
          data: Buffer.from(await file.arrayBuffer()),
          name: file.name,
          mimetype: file.type,
          size: file.size,
        },
      });
      clipIds.push(created.id);
    }

    await payload.create({
      collection: 'wedding-submissions',
      data: {
        wedding: wedding.id,
        submitterName: submitterName || undefined,
        note: note || undefined,
        photos: photoIds.map((image) => ({ image })),
        clips: clipIds.map((clip) => ({ clip })),
        youtubeUrls: youtubeUrls.map((url) => ({ url })),
        status: 'pending',
      },
    });

    return NextResponse.json(
      { ok: true, photos: photoIds.length, clips: clipIds.length, youtubeUrls: youtubeUrls.length },
      { status: 200 }
    );
  } catch (err) {
    console.error('[wedding-upload] unexpected error', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
