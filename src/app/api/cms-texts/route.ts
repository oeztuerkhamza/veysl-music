import { NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';
import { getPayloadClient } from '@/lib/payload';
import { routing } from '@/i18n/routing';
import { flattenMessages, getTextOverrides } from '@/lib/text-overrides';

export const dynamic = 'force-dynamic';

/**
 * Textkatalog und Speichern für die Vor-Ort-Textbearbeitung
 * (`src/components/cms/text-edit-overlay.tsx`).
 *
 * Beide Methoden prüfen die Sitzung gegen Payload, nicht gegen das
 * fälschbare Hinweis-Cookie (siehe `src/proxy.ts`). Ohne Sitzung: 401.
 */
async function requireUser(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  return user ? payload : null;
}

/** GET ?locale=de → alle Texte der Sprache (mit Korrekturen), die Originale und welche Schlüssel korrigiert sind. */
export async function GET(request: Request) {
  if (!(await requireUser(request))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const locale = new URL(request.url).searchParams.get('locale');
  if (!hasLocale(routing.locales, locale)) return NextResponse.json({ error: 'bad locale' }, { status: 400 });

  const original = flattenMessages((await import(`../../../../messages/${locale}.json`)).default);
  const overrides = await getTextOverrides(locale);

  const texts: Record<string, string> = { ...original };
  const overridden: string[] = [];
  for (const [key, value] of Object.entries(overrides)) {
    if (key in original) {
      texts[key] = value;
      overridden.push(key);
    }
  }

  return NextResponse.json({ texts, original, overridden });
}

/** POST { locale, key, value } speichert; leer (oder gleich dem Original) entfernt die Korrektur. */
export async function POST(request: Request) {
  const payload = await requireUser(request);
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { locale?: string; key?: string; value?: string | null } | null;
  if (!body || !hasLocale(routing.locales, body.locale) || typeof body.key !== 'string') {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const original = flattenMessages((await import(`../../../../messages/${body.locale}.json`)).default);
  if (!(body.key in original)) return NextResponse.json({ error: 'unknown key' }, { status: 404 });

  const slug = `${body.locale}:${body.key}`;
  const existing = await payload.find({ collection: 'text-overrides', where: { slug: { equals: slug } }, limit: 1, depth: 0 });
  const current = existing.docs[0];
  const value = typeof body.value === 'string' ? body.value.trim() : '';

  if (!value || value === original[body.key]) {
    if (current) await payload.delete({ collection: 'text-overrides', id: current.id });
  } else if (current) {
    await payload.update({ collection: 'text-overrides', id: current.id, data: { value } });
  } else {
    await payload.create({ collection: 'text-overrides', data: { locale: body.locale, key: body.key, value } });
  }

  return NextResponse.json({ ok: true });
}
