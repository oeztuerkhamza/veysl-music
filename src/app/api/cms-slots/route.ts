import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';
import { imageSlots } from '@/content/site-images';

export const dynamic = 'force-dynamic';

/**
 * Slot-Steckbriefe für die Vor-Ort-Bildbearbeitung.
 *
 * Warum eine eigene Route und nicht die Registry direkt im Client: Sie steht
 * in `src/content/site-images.ts`, und diese Datei importiert `server-only`
 * plus Payloads Local API. In ein Client-Bundle gehört sie nicht — und ihr
 * wertvollstes Feld (`purpose`, das Fotografen-Briefing) ist lang. Es in jedes
 * ausgelieferte HTML als `data-`-Attribut zu schreiben, hieße, jeden Besuch
 * mit Text zu belasten, den genau eine Person liest.
 *
 * Stattdessen: ein Aufruf, wenn das Overlay tatsächlich öffnet.
 *
 * Zugriff wird gegen Payload geprüft, nicht gegen das Hinweis-Cookie. Das
 * Cookie ist fälschbar (siehe `src/proxy.ts`); ohne gültige Sitzung gibt es
 * hier 401 — die Briefings sind zwar kein Geheimnis, aber eine Route, die
 * „nur für Admins" heißt und es nicht ist, wird irgendwann für etwas benutzt,
 * das es sein müsste.
 */
export async function GET(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    slots: imageSlots.map((slot) => ({
      key: slot.key,
      page: slot.page,
      label: slot.label,
      purpose: slot.purpose,
      altHint: slot.altHint,
      aspect: slot.aspect,
      dynamic: slot.dynamic ?? false,
    })),
  });
}
