'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';

/**
 * Türsteher der Hochzeits-Bearbeitung — dasselbe zweistufige Muster wie
 * `CmsEditLayer` (siehe dort für die ausführliche Begründung):
 *
 *   1. Cookie `dj-cms-hint` (gesetzt in `src/proxy.ts`) — kostenlos, aber
 *      fälschbar. Entscheidet nur, ob der Editor-Chunk überhaupt geladen wird.
 *   2. `GET /api/users/me` im Editor selbst — die echte Prüfung.
 *
 * Und selbst wenn beide getäuscht würden, scheitert jeder Schreibzugriff an
 * Payloads `isAdmin`-Regeln auf `weddings` und `media`. Die Oberfläche ist
 * Bequemlichkeit, nie Berechtigung.
 *
 * Anders als `CmsEditLayer` hängt diese Komponente nicht im Root-Layout,
 * sondern nur auf `/echte-hochzeiten` — der einzigen Seite, auf der es etwas
 * zu bearbeiten gibt. Besucherinnen und Besucher laden den Chunk nie.
 */
const WeddingEditor = dynamic(() => import('./wedding-editor').then((m) => m.WeddingEditor), { ssr: false });

const ADMIN_HINT_COOKIE = 'dj-cms-hint';

const subscribeNever = () => () => {};
const readHint = () =>
  typeof document !== 'undefined' &&
  document.cookie.split('; ').some((entry) => entry.startsWith(`${ADMIN_HINT_COOKIE}=`));
const readHintOnServer = () => false;

export function WeddingEditorLayer({ locale }: { locale: string }) {
  const enabled = useSyncExternalStore(subscribeNever, readHint, readHintOnServer);

  if (!enabled) return null;

  return <WeddingEditor locale={locale} />;
}
