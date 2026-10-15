import 'server-only';

import type { AbstractIntlMessages } from 'next-intl';
import { readFromCms } from '@/lib/payload';

/** `{ 'home.hero.title': 'Neuer Text' }` für eine Sprache. */
export type TextOverrideMap = Record<string, string>;

export async function getTextOverrides(locale: string): Promise<TextOverrideMap> {
  return readFromCms(
    async (payload) => {
      const { docs } = await payload.find({
        collection: 'text-overrides',
        where: { locale: { equals: locale } },
        limit: 5000,
        depth: 0,
        pagination: false,
      });
      const map: TextOverrideMap = {};
      for (const doc of docs) map[doc.key] = doc.value;
      return map;
    },
    {},
    'text-overrides',
  );
}

/**
 * Setzt jeden Override an seinen Pfad. Nur bestehende Textblätter werden
 * ersetzt: ein Schlüssel, den es nicht mehr gibt (Text im Code umbenannt),
 * wird ignoriert statt neue Pfade zu erfinden.
 */
export function applyTextOverrides(messages: AbstractIntlMessages, overrides: TextOverrideMap): AbstractIntlMessages {
  const keys = Object.keys(overrides);
  if (keys.length === 0) return messages;

  const result = structuredClone(messages) as AbstractIntlMessages;
  for (const key of keys) {
    const parts = key.split('.');
    let node: AbstractIntlMessages | string | undefined = result;
    for (const part of parts.slice(0, -1)) {
      node = typeof node === 'object' ? (node[part] as AbstractIntlMessages | string | undefined) : undefined;
    }
    const last = parts[parts.length - 1];
    if (typeof node === 'object' && typeof node[last] === 'string') node[last] = overrides[key];
  }
  return result;
}

/** Alle Textblätter einer Nachrichtendatei als flache `pfad → text`-Liste. */
export function flattenMessages(messages: AbstractIntlMessages, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  for (const [name, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${name}` : name;
    if (typeof value === 'string') out[path] = value;
    else if (value && typeof value === 'object') flattenMessages(value as AbstractIntlMessages, path, out);
  }
  return out;
}
