'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, X } from 'lucide-react';

/**
 * Bilder direkt auf der Seite austauschen, statt im Adminpanel den passenden
 * Slot zu suchen.
 *
 * Der Kern des Problems, das diese Datei löst, ist nicht das Hochladen — das
 * kann das Adminpanel längst. Es ist die Zuordnung: Wer im Panel steht, sieht
 * eine Liste von Schlüsseln wie `services.wedding.image` und muss wissen,
 * welche Fläche der Website damit gemeint ist. Wer auf der Seite steht, sieht
 * die Fläche und muss nur noch draufdrücken.
 *
 * Angehängt wird an `[data-cms-slot]` — dasselbe Attribut, das `<SiteImage>`
 * ohnehin auf jedes Bild schreibt. Es gibt also keine zweite Liste, die
 * veralten könnte: Ein neuer Slot ist automatisch bearbeitbar.
 *
 * Sicherheitslage, weil sie leicht falsch gelesen wird: Diese Oberfläche ist
 * Bequemlichkeit, nie Berechtigung. Sie prüft die Sitzung einmal gegen
 * `/api/users/me` und verschwindet ohne. Selbst wenn jemand das Hinweis-Cookie
 * fälscht *und* diese Prüfung umginge, laufen sämtliche Schreibzugriffe gegen
 * Payloads `isAdmin`-Regeln auf dem Server (`media`, `site-images`: create und
 * update nur für Admins). Der Browser entscheidet hier nichts.
 */

interface SlotInfo {
  key: string;
  page: string;
  label: string;
  purpose: string;
  altHint: string;
  dynamic: boolean;
}

interface Target {
  /** Der aufgelöste Schlüssel aus dem DOM, z. B. `city.header.background.stuttgart`. */
  fullKey: string;
  /** `null`, wenn der Slot über die Liste statt über ein sichtbares Element gewählt wurde — siehe dort. */
  element: HTMLElement | null;
}

/**
 * Zerlegt einen aufgelösten Schlüssel wieder in Registry-Slot und Instanz-ID.
 *
 * Dynamische Slots erscheinen im DOM als `${slotKey}.${id}` (siehe
 * `dynamicSlotKey()`), die Payload-Collection speichert beide getrennt. Da
 * beide Teile Punkte enthalten können, wird der *längste* passende
 * Registry-Schlüssel gesucht statt am letzten Punkt getrennt — sonst würde
 * `city.header.background.stuttgart` zu `city.header` plus Unsinn.
 */
function splitKey(fullKey: string, slots: SlotInfo[]): { slotKey: string; dynamicId?: string } | null {
  const exact = slots.find((slot) => slot.key === fullKey);
  if (exact) return { slotKey: exact.key };

  const prefixed = slots
    .filter((slot) => slot.dynamic && fullKey.startsWith(`${slot.key}.`))
    .sort((a, b) => b.key.length - a.key.length)[0];

  if (!prefixed) return null;
  return { slotKey: prefixed.key, dynamicId: fullKey.slice(prefixed.key.length + 1) };
}

/**
 * Zwischengespeicherter Schnappschuss der Slot-Elemente im DOM.
 *
 * `useSyncExternalStore` verlangt, dass `getSnapshot()` bei unverändertem
 * Zustand dieselbe Referenz liefert — ein frisch gebautes Array bei jedem
 * Aufruf löst eine Endlosschleife aus. Verglichen wird deshalb über die
 * verketteten Schlüssel: Ändert sich die Menge der Slots nicht, bleibt das
 * alte Array bestehen, auch wenn der Beobachter zwischendurch feuert.
 */
let slotSnapshot: Target[] = [];
let slotSignature = '';

function readSlotTargets(): Target[] {
  const found = [...document.querySelectorAll<HTMLElement>('[data-cms-slot]')]
    .map((element) => ({ fullKey: element.dataset.cmsSlot ?? '', element }))
    .filter((target) => target.fullKey.length > 0);
  const signature = found.map((target) => target.fullKey).join('|');
  if (signature !== slotSignature) {
    slotSignature = signature;
    slotSnapshot = found;
  }
  return slotSnapshot;
}

const EMPTY_TARGETS: Target[] = [];
const readNoTargets = () => EMPTY_TARGETS;

function subscribeToSlots(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

export function EditOverlay() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [active, setActive] = useState<Target | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sitzung + Steckbriefe. Schlägt eines fehl, bleibt die Oberfläche aus —
  // eine halbe Bearbeitungsschicht ist schlimmer als keine.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch('/api/users/me', { credentials: 'include' });
        if (!me.ok) return;
        const meBody = (await me.json()) as { user?: unknown };
        if (!meBody.user) return;

        const res = await fetch('/api/cms-slots', { credentials: 'include' });
        if (!res.ok) return;
        const body = (await res.json()) as { slots: SlotInfo[] };
        if (cancelled) return;
        setSlots(body.slots);
        setReady(true);
      } catch {
        // Offline oder abgemeldet: still aussteigen, die Seite funktioniert ohne.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Slots im DOM einsammeln.
  //
  // `useSyncExternalStore` statt `setState` im Effekt (siehe die gleiche
  // Begründung in edit-layer.tsx). Der `MutationObserver` ist hier das
  // Abonnement: Next navigiert zwischen Seiten, ohne diese Komponente neu zu
  // montieren — ohne ihn hätte die zweite Seite keine Knöpfe.
  //
  // Der Schnappschuss muss stabil sein, sonst dreht React im Kreis. Deshalb
  // wird er zwischengespeichert und nur dann neu gebaut, wenn sich die Liste
  // der Schlüssel tatsächlich geändert hat — nicht bei jeder DOM-Mutation.
  const targets = useSyncExternalStore(subscribeToSlots, readSlotTargets, readNoTargets);

  /**
   * Markiert das Dokument als „im Bearbeitungsmodus".
   *
   * Daran hängt eine einzige CSS-Regel in globals.css, die den leeren
   * Bildzustand positionierbar macht — der bebilderte Container ist ohnehin
   * schon `relative`. Über eine Klasse statt über Inline-Styles auf den
   * einzelnen Elementen, aus zwei Gründen: React darf fremde DOM-Knoten, die
   * es als Prop bekommt, nicht mutieren (`react-hooks/immutability` weist das
   * zu Recht zurück), und eine Regel, die nur unter dieser Klasse gilt, kann
   * das Layout für Besucher gar nicht erst verändern.
   */
  useEffect(() => {
    document.body.classList.add('cms-editing');
    return () => document.body.classList.remove('cms-editing');
  }, []);

  const upload = useCallback(
    async (file: File) => {
      if (!active) return;
      const parts = splitKey(active.fullKey, slots);
      if (!parts) {
        setError(`Unbekannter Slot: ${active.fullKey}`);
        return;
      }

      setBusy(true);
      setError(null);
      try {
        // 1. Datei in die Medienbibliothek. `alt` ist in `media` Pflicht;
        //    der Slot-Steckbrief sagt, was drinstehen soll — hier wird ein
        //    brauchbarer Startwert gesetzt, den man im Panel schärfen kann.
        const slot = slots.find((s) => s.key === parts.slotKey);
        const form = new FormData();
        form.append('file', file);
        form.append('_payload', JSON.stringify({ alt: slot?.label ?? active.fullKey }));

        const upload = await fetch('/api/media', { method: 'POST', body: form, credentials: 'include' });
        if (!upload.ok) throw new Error(`Upload fehlgeschlagen (${upload.status})`);
        const uploaded = (await upload.json()) as { doc?: { id: string } };
        const mediaId = uploaded.doc?.id;
        if (!mediaId) throw new Error('Upload lieferte keine Medien-ID');

        // 2. Slot-Datensatz: vorhandenen aktualisieren, sonst anlegen. Ein
        //    zweiter Datensatz für denselben Schlüssel wäre kein Fehler, den
        //    man sieht — `resolveSlot()` nähme einfach einen von beiden.
        const query = new URLSearchParams({ 'where[key][equals]': active.fullKey, limit: '1' });
        const existing = await fetch(`/api/site-images?${query}`, { credentials: 'include' });
        if (!existing.ok) throw new Error(`Slot-Abfrage fehlgeschlagen (${existing.status})`);
        const existingBody = (await existing.json()) as { docs?: Array<{ id: string }> };
        const current = existingBody.docs?.[0];

        const payload = JSON.stringify({
          slotKey: parts.slotKey,
          ...(parts.dynamicId ? { dynamicId: parts.dynamicId } : {}),
          image: mediaId,
        });

        const write = current
          ? await fetch(`/api/site-images/${current.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              credentials: 'include',
            })
          : await fetch('/api/site-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              credentials: 'include',
            });

        if (!write.ok) throw new Error(`Speichern fehlgeschlagen (${write.status})`);

        // 3. Der `afterChange`-Hook auf beiden Collections hat den Seitencache
        //    bereits verworfen (src/payload/revalidate.ts). `refresh()` holt
        //    die neu gerenderte Seite, ohne dass die Ansicht springt.
        setActive(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setBusy(false);
      }
    },
    [active, router, slots]
  );

  if (!ready) return null;

  const activeSlot = active ? slots.find((s) => s.key === splitKey(active.fullKey, slots)?.slotKey) : undefined;


  const placedKeys = new Set(targets.map((target) => target.fullKey));

  return (
    <>
      {targets.map((target) => (
        <SlotButton key={target.fullKey} target={target} onOpen={() => setActive(target)} />
      ))}

      {/*
        Die Slot-Liste ist nicht die Notlösung, sondern für den heutigen Zustand
        der wichtigere Weg: Laut `.claude/BRAND-FACTS.md` existiert noch kein
        einziges brauchbares Hochzeitsfoto, also rendert fast jeder Slot einen
        leeren Zustand — und der Hero der Startseite rendert überhaupt nichts,
        solange er leer ist. Ein Werkzeug, das nur bereits vorhandene Bilder
        ersetzen kann, wäre am ersten Tag nutzlos.
      */}
      <button
        type="button"
        onClick={() => setListOpen(true)}
        className="fixed bottom-4 start-4 z-[190] inline-flex items-center gap-2 rounded-full border border-gold/60 bg-black/80 px-4 py-2 text-xs font-medium text-gold shadow-lg backdrop-blur-sm transition-colors hover:bg-black"
      >
        <Camera className="size-3.5" />
        Bilder ({targets.length}/{slots.length})
      </button>

      {listOpen ? (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg border border-line bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">Bild-Slots</p>
                <h2 className="mt-1 font-display text-2xl text-ink">Alle Bilder der Website</h2>
              </div>
              <button
                type="button"
                onClick={() => setListOpen(false)}
                aria-label="Schließen"
                className="rounded-full border border-line p-2 text-ink-muted transition-colors hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <ul className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {slots
                .filter((slot) => !slot.dynamic)
                .map((slot) => (
                  <li key={slot.key}>
                    <button
                      type="button"
                      onClick={() => {
                        setListOpen(false);
                        setActive({ fullKey: slot.key, element: null });
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-start text-sm text-ink transition-colors hover:bg-surface-2"
                    >
                      <span>
                        <span className="block">{slot.label}</span>
                        <span className="block text-xs text-ink-faint">{slot.page}</span>
                      </span>
                      {placedKeys.has(slot.key) ? (
                        <span className="shrink-0 text-xs text-gold">auf dieser Seite</span>
                      ) : null}
                    </button>
                  </li>
                ))}
            </ul>
            <p className="mt-4 shrink-0 text-xs text-ink-faint">
              Dynamische Slots (Städte, Artikel, Kundenstimmen) erscheinen nur direkt auf der jeweiligen Seite.
            </p>
          </div>
        </div>
      ) : null}

      {active ? (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-lg border border-line bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">{activeSlot?.page ?? 'Bild-Slot'}</p>
                <h2 className="mt-1 font-display text-2xl text-ink">{activeSlot?.label ?? active.fullKey}</h2>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Schließen"
                className="rounded-full border border-line p-2 text-ink-muted transition-colors hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            {activeSlot ? (
              <p className="mt-4 max-h-40 overflow-y-auto text-sm leading-relaxed text-ink-muted">{activeSlot.purpose}</p>
            ) : null}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="mt-6 block w-full text-sm text-ink-muted file:me-4 file:rounded-md file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--gold-ink)]"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
              disabled={busy}
            />

            <p className="mt-3 text-xs text-ink-faint">{activeSlot?.altHint}</p>

            {busy ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
                <Loader2 className="size-4 animate-spin" /> Wird hochgeladen …
              </p>
            ) : null}
            {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

            <p className="mt-6 text-xs text-ink-faint">
              Slot-Schlüssel: <code>{active.fullKey}</code>
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Der Knopf sitzt absolut positioniert *im* Bild-Container, nicht in einer
 * eigenen Ebene über der Seite: So wandert er beim Scrollen und bei
 * Layoutänderungen von selbst mit, statt per `getBoundingClientRect()`
 * nachgeführt werden zu müssen.
 */
function SlotButton({ target, onOpen }: { target: Target; onOpen: () => void }) {
  if (!target.element) return null;

  const button: ReactNode = (
    <button
      type="button"
      onClick={onOpen}
      title={`Bild ändern — ${target.fullKey}`}
      className="absolute end-2 top-2 z-50 inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-black/70 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur-sm transition-colors hover:bg-black/85"
    >
      <Camera className="size-3.5" />
      Bild ändern
    </button>
  );

  return createPortal(button, target.element);
}
