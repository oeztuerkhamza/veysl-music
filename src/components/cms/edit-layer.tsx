'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';

/**
 * Der Türsteher der Vor-Ort-Bildbearbeitung.
 *
 * Diese Komponente hängt im Root-Layout und läuft damit auf jeder Seite —
 * deshalb enthält sie selbst fast nichts. Sie liest ein Cookie und rendert in
 * aller Regel `null`. Die eigentliche Oberfläche (`<EditOverlay>`) steckt
 * hinter `next/dynamic` und wird erst *angefordert*, wenn der Hinweis da ist:
 * Für Besucherinnen und Besucher wird dieser Chunk nie geladen.
 *
 * Das ist keine Feinheit, sondern Bedingung. Die Startseite ist gerade erst
 * von 1.932 KB auf 654 KB JavaScript gebracht worden; ein Editor, den eine
 * einzige Person benutzt, darf davon nichts zurücknehmen.
 *
 * Zwei Stufen, mit Absicht:
 *   1. Das Cookie `dj-cms-hint` (gesetzt in `src/proxy.ts`) — kostenlos, aber
 *      fälschbar. Es entscheidet nur, ob überhaupt geladen wird.
 *   2. `GET /api/users/me` im Overlay selbst — die echte Prüfung.
 * Und selbst wenn beide getäuscht würden, scheitert jeder Schreibzugriff an
 * Payloads `isAdmin`-Regeln auf dem Server. Die Oberfläche ist Bequemlichkeit,
 * nie Berechtigung.
 */
const EditOverlay = dynamic(() => import('./edit-overlay').then((m) => m.EditOverlay), { ssr: false });

const ADMIN_HINT_COOKIE = 'dj-cms-hint';

/**
 * `useSyncExternalStore` statt `useState` + `useEffect`.
 *
 * Der naheliegende Weg wäre, das Cookie in einem Effekt zu lesen und per
 * `setState` zu übernehmen — aber genau das verbietet die ESLint-Regel
 * `react-hooks/set-state-in-effect` in diesem Projekt, und zwar zu Recht: Es
 * erzeugt einen zweiten Renderdurchlauf für einen Wert, der schon vorher
 * feststand. `useSyncExternalStore` ist der dafür vorgesehene Mechanismus und
 * löst zugleich das Server/Client-Problem — der dritte Parameter liefert den
 * Serverwert, hier immer `false`, sodass das vorgerenderte HTML für alle
 * identisch bleibt.
 *
 * Es gibt nichts zu abonnieren: Ein Cookie ändert sich nicht innerhalb eines
 * Seitenaufrufs, und An-/Abmelden lädt die Seite ohnehin neu. `subscribe`
 * bleibt deshalb ein No-op.
 */
const subscribeNever = () => () => {};
const readHint = () =>
  typeof document !== 'undefined' &&
  document.cookie.split('; ').some((entry) => entry.startsWith(`${ADMIN_HINT_COOKIE}=`));
const readHintOnServer = () => false;

export function CmsEditLayer() {
  const enabled = useSyncExternalStore(subscribeNever, readHint, readHintOnServer);

  if (!enabled) return null;

  return <EditOverlay />;
}
