'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, RotateCcw, Search, Type, X } from 'lucide-react';

/**
 * Texte direkt auf der Seite korrigieren — das Gegenstück zu `edit-overlay.tsx`
 * (Bilder).
 *
 * Die Seite weiß im Browser nicht, welcher Schlüssel in `messages/<sprache>.json`
 * zu welchem Satz gehört: Das HTML ist vorgerendert, die Schlüssel sind längst
 * aufgelöst. Statt sie in jedes ausgelieferte Element zu schreiben (Last für
 * alle Besucher, für eine Person), wird beim Anklicken rückwärts gesucht: Der
 * angeklickte Text wird mit dem Katalog der aktuellen Sprache verglichen
 * (`GET /api/cms-texts`, nur mit Sitzung). Sätze mit Platzhaltern (`{name}`)
 * oder Tags (`<b>…</b>`) werden über ein daraus gebautes Muster gefunden.
 *
 * Was sich so nicht anklicken lässt (Seitentitel, Meta-Beschreibungen,
 * `aria-label`), steht über die Suche trotzdem zur Verfügung.
 *
 * Sicherheit wie beim Bild-Overlay: Diese Oberfläche ist Bequemlichkeit. Der
 * Katalog und das Speichern prüfen die Sitzung auf dem Server (`401` ohne).
 */

interface Catalog {
  texts: Record<string, string>;
  original: Record<string, string>;
  overridden: string[];
}

interface Candidate {
  key: string;
}

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Baut aus einem Satz mit `{platzhalter}` / `<b>`-Tags ein Suchmuster; `null`, wenn der Satz schlicht ist. */
function toPattern(value: string): RegExp | null {
  if (!/[{<]/.test(value)) return null;
  const plain = value.replace(/<\/?[a-zA-Z][^>]*>/g, '');
  const parts = plain.split(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
  const source = parts.map((part) => escapeRegExp(normalize(part))).join('.+?');
  const compact = normalize(source);
  if (compact.replace(/\.\+\?/g, '').length < 6) return null;
  try {
    return new RegExp(`^${compact}$`);
  } catch {
    return null;
  }
}

function buildIndex(texts: Record<string, string>) {
  const exact = new Map<string, string[]>();
  const patterns: Array<{ key: string; regex: RegExp }> = [];
  for (const [key, value] of Object.entries(texts)) {
    const plain = normalize(value);
    if (plain.length < 2) continue;
    const list = exact.get(plain);
    if (list) list.push(key);
    else exact.set(plain, [key]);
    const regex = toPattern(value);
    if (regex) patterns.push({ key, regex });
  }
  return { exact, patterns };
}

type Index = ReturnType<typeof buildIndex>;

function findKeys(text: string, index: Index): string[] {
  const hit = index.exact.get(text);
  if (hit) return hit;
  return index.patterns.filter(({ regex }) => regex.test(text)).map(({ key }) => key);
}

/** Vom angeklickten Element nach oben, bis ein Text im Katalog steht. */
function resolveTarget(start: EventTarget | null, index: Index): { element: HTMLElement; keys: string[] } | null {
  let element = start instanceof HTMLElement ? start : null;
  for (let depth = 0; element && element !== document.body && depth < 7; depth += 1, element = element.parentElement) {
    if (element.closest('[data-cms-text-ui]')) return null;
    const text = normalize(element.textContent ?? '');
    if (text.length < 2 || text.length > 1500) continue;
    const keys = findKeys(text, index);
    if (keys.length > 0) return { element, keys };
  }
  return null;
}

export function TextEditOverlay() {
  const router = useRouter();
  const locale = useLocale();
  const [ready, setReady] = useState(false);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [mode, setMode] = useState(false);
  const [hover, setHover] = useState<DOMRect | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const catalogLocale = useRef<string | null>(null);

  const index = useMemo(() => (catalog ? buildIndex(catalog.texts) : null), [catalog]);

  const loadCatalog = useCallback(async () => {
    const res = await fetch(`/api/cms-texts?locale=${encodeURIComponent(locale)}`, { credentials: 'include' });
    if (!res.ok) throw new Error(String(res.status));
    setCatalog((await res.json()) as Catalog);
  }, [locale]);

  // Sitzung + Katalog. Ohne beides bleibt die Oberfläche aus.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch('/api/users/me', { credentials: 'include' });
        if (!me.ok || !((await me.json()) as { user?: unknown }).user) return;
        if (!cancelled) setReady(true);
      } catch {
        // Offline oder abgemeldet: still aussteigen.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Katalog erst laden, wenn er gebraucht wird (Knopfdruck) — und neu, wenn
  // die Sprache gewechselt wurde.
  const ensureCatalog = useCallback(() => {
    if (catalogLocale.current === locale) return;
    catalogLocale.current = locale;
    loadCatalog().catch(() => {
      catalogLocale.current = null;
      setError('Textkatalog konnte nicht geladen werden.');
    });
  }, [locale, loadCatalog]);

  const open = useCallback(
    (key: string) => {
      if (!catalog) return;
      setActiveKey(key);
      setDraft(catalog.texts[key] ?? '');
      setCandidates(null);
      setSearchOpen(false);
      setError(null);
    },
    [catalog],
  );

  // Klicks abfangen, solange der Textmodus an ist.
  useEffect(() => {
    if (!mode || !index) return;

    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest?.('[data-cms-text-ui]')) return;
      event.preventDefault();
      event.stopPropagation();
      const found = resolveTarget(event.target, index);
      if (!found) {
        setError('Hier wurde kein bearbeitbarer Text erkannt — „Suchen" nutzen.');
        return;
      }
      setError(null);
      if (found.keys.length === 1) open(found.keys[0]);
      else setCandidates(found.keys.map((key) => ({ key })));
    };

    const onOver = (event: MouseEvent) => {
      const found = resolveTarget(event.target, index);
      setHover(found ? found.element.getBoundingClientRect() : null);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMode(false);
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('keydown', onKey);
      setHover(null);
    };
  }, [mode, index, open]);

  const save = useCallback(
    async (value: string | null) => {
      if (!activeKey) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch('/api/cms-texts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale, key: activeKey, value }),
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Speichern fehlgeschlagen (${res.status})`);
        setActiveKey(null);
        await loadCatalog();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setBusy(false);
      }
    },
    [activeKey, locale, loadCatalog, router],
  );

  const results = useMemo(() => {
    if (!catalog || query.trim().length < 2) return [];
    const needle = query.trim().toLowerCase();
    return Object.entries(catalog.texts)
      .filter(([key, value]) => key.toLowerCase().includes(needle) || value.toLowerCase().includes(needle))
      .slice(0, 40);
  }, [catalog, query]);

  if (!ready) return null;

  const isOverridden = activeKey ? catalog?.overridden.includes(activeKey) : false;

  return (
    <div data-cms-text-ui>
      {hover && mode ? (
        <div
          className="pointer-events-none fixed z-[180] rounded-sm outline outline-2 outline-offset-2 outline-gold"
          style={{ top: hover.top, left: hover.left, width: hover.width, height: hover.height }}
        />
      ) : null}

      <div className="fixed bottom-4 start-36 z-[190] flex gap-2">
        <button
          type="button"
          onClick={() => {
            ensureCatalog();
            setMode((on) => !on);
          }}
          className={`inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-sm transition-colors ${
            mode ? 'bg-gold text-[var(--gold-ink)]' : 'bg-black/80 text-gold hover:bg-black'
          }`}
        >
          <Type className="size-3.5" />
          {mode ? 'Textmodus beenden' : 'Texte'}
        </button>
        <button
          type="button"
          onClick={() => {
            ensureCatalog();
            setSearchOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-black/80 px-4 py-2 text-xs font-medium text-gold shadow-lg backdrop-blur-sm transition-colors hover:bg-black"
        >
          <Search className="size-3.5" />
          Suchen
        </button>
      </div>

      {mode && !activeKey && !candidates ? (
        <div className="fixed inset-x-0 top-0 z-[190] bg-gold px-4 py-2 text-center text-xs font-medium text-[var(--gold-ink)]">
          Textmodus: Text auf der Seite anklicken, um ihn zu ändern. Esc beendet. Links sind jetzt abgeschaltet.
          {error ? <span className="ms-3 font-semibold">{error}</span> : null}
        </div>
      ) : null}

      {candidates ? (
        <Modal title="Welcher Text?" subtitle="Mehrere Einträge haben denselben Wortlaut" onClose={() => setCandidates(null)}>
          <ul className="mt-4 space-y-1">
            {candidates.map(({ key }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => open(key)}
                  className="w-full rounded-md px-3 py-2 text-start text-sm text-ink transition-colors hover:bg-surface-2"
                >
                  <code className="text-xs text-ink-faint">{key}</code>
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      ) : null}

      {searchOpen ? (
        <Modal title="Texte suchen" subtitle={`Alle Texte der Sprache ${locale.toUpperCase()}`} onClose={() => setSearchOpen(false)}>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Wort oder Schlüssel …"
            className="mt-4 w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink"
          />
          {!catalog ? <p className="mt-3 text-sm text-ink-muted">Wird geladen …</p> : null}
          <ul className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto">
            {results.map(([key, value]) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => open(key)}
                  className="w-full rounded-md px-3 py-2 text-start transition-colors hover:bg-surface-2"
                >
                  <span className="line-clamp-2 block text-sm text-ink">{value}</span>
                  <span className="block text-xs text-ink-faint">
                    {key}
                    {catalog?.overridden.includes(key) ? ' · geändert' : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      ) : null}

      {activeKey ? (
        <Modal
          title="Text ändern"
          subtitle={`${locale.toUpperCase()} · ${activeKey}${isOverridden ? ' · geändert' : ''}`}
          onClose={() => setActiveKey(null)}
        >
          <textarea
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={Math.min(14, Math.max(4, Math.ceil(draft.length / 60)))}
            className="mt-4 w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-sm leading-relaxed text-ink"
          />
          <p className="mt-2 text-xs text-ink-faint">
            Platzhalter wie <code>{'{name}'}</code> und Tags wie <code>{'<b>…</b>'}</code> unverändert lassen.
          </p>
          {isOverridden && catalog ? (
            <p className="mt-2 text-xs text-ink-faint">Original: {catalog.original[activeKey]}</p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={() => void save(draft)}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-[var(--gold-ink)] disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Speichern
            </button>
            {isOverridden ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void save(null)}
                className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm text-ink-muted hover:text-ink"
              >
                <RotateCcw className="size-4" />
                Original wiederherstellen
              </button>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-lg border border-line bg-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.15em] text-ink-faint">{subtitle}</p>
            <h2 className="mt-1 font-display text-2xl text-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full border border-line p-2 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
