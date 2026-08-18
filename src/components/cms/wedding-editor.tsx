'use client';

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { HeartHandshake, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';

/**
 * Hochzeiten direkt auf der Seite anlegen, bearbeiten und löschen — Fotos,
 * YouTube-Videos und Text in einem Formular.
 *
 * Warum das neben dem Adminpanel existiert, ist dasselbe Argument wie bei
 * `EditOverlay` für die Bild-Slots: Das Panel kann all das längst, aber es
 * verlangt, dass man den Weg dorthin kennt — Collection suchen, Datensatz
 * anlegen, Medien einzeln hochladen und zuordnen, Sprache umschalten. Wer auf
 * `/echte-hochzeiten` steht, sieht stattdessen die Referenz, die er meint,
 * und drückt darauf.
 *
 * Sicherheitslage, weil sie leicht falsch gelesen wird: Diese Oberfläche ist
 * Bequemlichkeit, nie Berechtigung. Sie prüft die Sitzung einmal gegen
 * `/api/users/me` und verschwindet ohne. Sämtliche Schreibzugriffe laufen
 * gegen Payloads `isAdmin`-Regeln auf `weddings` und `media` — der Browser
 * entscheidet hier nichts.
 *
 * Sprachen: Fließtext und Video-Bildunterschriften sind lokalisiert, alles
 * andere nicht (siehe Collection). Geschrieben wird immer in die Sprache, in
 * der die Seite gerade steht — wer den türkischen Text pflegen will, ruft die
 * Seite auf Türkisch auf. Gelesen wird beim Öffnen mit
 * `fallback-locale=none`, sonst stünde der deutsche Text im türkischen
 * Formular und würde beim Speichern als „türkische Übersetzung“ festgehalten.
 */

interface EditorPhoto {
  /**
   * Die ID unverändert so, wie Payload sie geliefert hat — Zahl bei
   * SQLite/Postgres, Zeichenkette bei Mongo. Nicht in einen String
   * umwandeln: `gallery[].image` ist ein Upload-Feld, und Payload weist
   * eine `"5"` dort mit „Das folgende Feld ist nicht korrekt: Fotogalerie
   * 1 > Foto“ zurück, wo eine `5` durchgeht.
   */
  mediaId: string | number;
  url: string;
  alt: string;
}

interface EditorVideo {
  url: string;
  title: string;
}

interface FormState {
  id?: string;
  coupleLabel: string;
  city: string;
  venue: string;
  date: string;
  guestCount: string;
  status: 'draft' | 'published';
  story: string;
  cover: EditorPhoto | null;
  gallery: EditorPhoto[];
  videos: EditorVideo[];
}

interface WeddingListItem {
  id: string;
  coupleLabel: string;
  city?: string;
  date?: string;
  status: 'draft' | 'published';
}

const EMPTY_FORM: FormState = {
  coupleLabel: '',
  city: '',
  venue: '',
  date: '',
  guestCount: '',
  status: 'published',
  story: '',
  cover: null,
  gallery: [],
  videos: [],
};

/** Nur YouTube — dieselbe Regel, die die Collection serverseitig erzwingt, hier als sofortige Rückmeldung. */
const YOUTUBE_HOST = /(^|\.)(youtube\.com|youtu\.be)$/i;

function looksLikeYouTube(value: string): boolean {
  try {
    return YOUTUBE_HOST.test(new URL(value.trim()).hostname);
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------
 * Anker im DOM
 *
 * Die Bearbeiten-/Löschen-Knöpfe hängen an `[data-wedding-id]`, das
 * `WeddingEntry` ohnehin schreibt — dieselbe Konstruktion wie `[data-cms-slot]`
 * in `edit-overlay.tsx`, aus demselben Grund: keine zweite Liste, die
 * veralten kann.
 *
 * `useSyncExternalStore` verlangt einen stabilen Schnappschuss; ein bei jedem
 * Aufruf frisch gebautes Array dreht sich in eine Endlosschleife. Verglichen
 * wird deshalb über die verketteten IDs.
 * ---------------------------------------------------------------------- */
interface Anchor {
  id: string;
  element: HTMLElement;
}

let anchorSnapshot: Anchor[] = [];
let anchorSignature = '';

function readAnchors(): Anchor[] {
  const found = [...document.querySelectorAll<HTMLElement>('[data-wedding-id]')]
    .map((element) => ({ id: element.dataset.weddingId ?? '', element }))
    .filter((anchor) => anchor.id.length > 0);
  const signature = found.map((anchor) => anchor.id).join('|');
  if (signature !== anchorSignature) {
    anchorSignature = signature;
    anchorSnapshot = found;
  }
  return anchorSnapshot;
}

const EMPTY_ANCHORS: Anchor[] = [];
const readNoAnchors = () => EMPTY_ANCHORS;

function subscribeToAnchors(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

export function WeddingEditor({ locale }: { locale: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [list, setList] = useState<WeddingListItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sitzung prüfen. Schlägt sie fehl, bleibt die Oberfläche aus — eine halbe
  // Bearbeitungsschicht ist schlimmer als keine.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });
        if (!res.ok) return;
        const body = (await res.json()) as { user?: unknown };
        if (!body.user || cancelled) return;
        setReady(true);
      } catch {
        // Offline oder abgemeldet: still aussteigen, die Seite funktioniert ohne.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const anchors = useSyncExternalStore(subscribeToAnchors, readAnchors, readNoAnchors);

  /** Lädt eine Hochzeit in das Formular — ohne Sprach-Rückfall, siehe Kopfkommentar. */
  const openExisting = useCallback(
    async (id: string) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(`/api/weddings/${id}?depth=1&locale=${locale}&fallback-locale=none`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Laden fehlgeschlagen (${res.status})`);
        const doc = (await res.json()) as {
          id: string | number;
          coupleLabel?: string | null;
          city?: string | null;
          venue?: string | null;
          date?: string | null;
          guestCount?: number | null;
          status?: string | null;
          story?: string | null;
          coverImage?: { id: string | number; url?: string | null; alt?: string | null } | null;
          gallery?: { image?: { id: string | number; url?: string | null; alt?: string | null } | null }[] | null;
          videos?: { url?: string | null; title?: string | null }[] | null;
        };

        const toPhoto = (
          media: { id: string | number; url?: string | null; alt?: string | null } | null | undefined
        ): EditorPhoto | null =>
          media && media.url ? { mediaId: media.id, url: media.url, alt: media.alt ?? '' } : null;

        setList(null);
        setForm({
          id: String(doc.id),
          coupleLabel: doc.coupleLabel ?? '',
          city: doc.city ?? '',
          venue: doc.venue ?? '',
          date: doc.date ?? '',
          guestCount: doc.guestCount != null ? String(doc.guestCount) : '',
          status: doc.status === 'draft' ? 'draft' : 'published',
          story: doc.story ?? '',
          cover: toPhoto(doc.coverImage),
          gallery: (doc.gallery ?? [])
            .map((entry) => toPhoto(entry?.image))
            .filter((photo): photo is EditorPhoto => photo !== null),
          videos: (doc.videos ?? []).map((video) => ({ url: video.url ?? '', title: video.title ?? '' })),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setBusy(false);
      }
    },
    [locale]
  );

  /** Alle Hochzeiten, Entwürfe eingeschlossen — die kommen auf der öffentlichen Seite nicht vor und wären sonst unerreichbar. */
  const openList = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/weddings?limit=100&depth=0&sort=-date', { credentials: 'include' });
      if (!res.ok) throw new Error(`Liste konnte nicht geladen werden (${res.status})`);
      const body = (await res.json()) as {
        docs?: { id: string | number; coupleLabel?: string | null; city?: string | null; date?: string | null; status?: string | null }[];
      };
      setList(
        (body.docs ?? []).map((doc) => ({
          id: String(doc.id),
          coupleLabel: doc.coupleLabel ?? '—',
          city: doc.city ?? undefined,
          date: doc.date ?? undefined,
          status: doc.status === 'draft' ? 'draft' : 'published',
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setBusy(false);
    }
  }, []);

  /**
   * Datei in die Medienbibliothek. `alt` ist in `media` Pflicht — hier wird
   * ein brauchbarer Startwert gesetzt, den das Formular anschließend pro Foto
   * überschreiben lässt (Feld unter der Vorschau).
   */
  const uploadPhoto = useCallback(
    async (file: File, altSeed: string): Promise<EditorPhoto> => {
      const body = new FormData();
      body.append('file', file);
      body.append('_payload', JSON.stringify({ alt: altSeed }));

      const res = await fetch(`/api/media?locale=${locale}`, { method: 'POST', body, credentials: 'include' });
      if (!res.ok) throw new Error(`Upload fehlgeschlagen (${res.status})`);
      const uploaded = (await res.json()) as { doc?: { id: string | number; url?: string | null } };
      const doc = uploaded.doc;
      if (!doc?.id || !doc.url) throw new Error('Upload lieferte keine Datei zurück');

      return { mediaId: doc.id, url: doc.url, alt: altSeed };
    },
    [locale]
  );

  const addFiles = useCallback(
    async (files: FileList, target: 'cover' | 'gallery') => {
      if (!form) return;
      setBusy(true);
      setError(null);
      try {
        const altSeed = [form.coupleLabel, form.city].filter(Boolean).join(' — ') || 'Hochzeit';
        const uploaded: EditorPhoto[] = [];
        // Nacheinander, nicht parallel: ein Schwung Handyfotos gleichzeitig
        // durch `sharp` zu schicken, bringt den Container eher an die
        // Speichergrenze, als dass es Zeit spart.
        for (const file of Array.from(files)) {
          uploaded.push(await uploadPhoto(file, altSeed));
        }
        setForm((current) =>
          current
            ? target === 'cover'
              ? { ...current, cover: uploaded[0] ?? current.cover }
              : { ...current, gallery: [...current.gallery, ...uploaded] }
            : current
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setBusy(false);
      }
    },
    [form, uploadPhoto]
  );

  /** Alt-Text nachschärfen. Direkt am Medium, nicht an der Hochzeit — dort gehört er hin und wirkt überall, wo das Bild sonst noch auftaucht. */
  const saveAlt = useCallback(
    async (photo: EditorPhoto) => {
      try {
        await fetch(`/api/media/${photo.mediaId}?locale=${locale}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alt: photo.alt }),
          credentials: 'include',
        });
      } catch {
        // Ein misslungener Alt-Text darf das Formular nicht blockieren; das
        // Bild ist gespeichert, der Text lässt sich jederzeit nachtragen.
      }
    },
    [locale]
  );

  const save = useCallback(async () => {
    if (!form) return;
    if (!form.coupleLabel.trim()) {
      setError('Bitte eine Bezeichnung für das Paar angeben.');
      return;
    }
    const badVideo = form.videos.find((video) => video.url.trim() && !looksLikeYouTube(video.url));
    if (badVideo) {
      setError(`Kein YouTube-Link: ${badVideo.url}`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const payload = {
        coupleLabel: form.coupleLabel.trim(),
        city: form.city.trim() || null,
        venue: form.venue.trim() || null,
        date: form.date.trim() || null,
        guestCount: form.guestCount.trim() ? Number(form.guestCount) : null,
        status: form.status,
        story: form.story.trim() || null,
        coverImage: form.cover?.mediaId ?? null,
        gallery: form.gallery.map((photo) => ({ image: photo.mediaId })),
        videos: form.videos
          .filter((video) => video.url.trim())
          .map((video) => ({ url: video.url.trim(), title: video.title.trim() || null })),
      };

      const res = form.id
        ? await fetch(`/api/weddings/${form.id}?locale=${locale}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          })
        : await fetch(`/api/weddings?locale=${locale}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          });

      if (!res.ok) {
        // Payload schickt seine Feldfehler mit — die sind brauchbarer als ein
        // nackter Statuscode ("Nur YouTube-Links werden unterstützt …").
        const detail = (await res.json().catch(() => null)) as { errors?: { message?: string }[] } | null;
        throw new Error(detail?.errors?.[0]?.message ?? `Speichern fehlgeschlagen (${res.status})`);
      }

      // Der `afterChange`-Hook der Collection hat den Seitencache bereits
      // verworfen (src/payload/revalidate.ts); `refresh()` holt die neu
      // gerenderte Seite, ohne dass die Ansicht springt.
      setForm(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setBusy(false);
    }
  }, [form, locale, router]);

  const remove = useCallback(
    async (id: string, label: string) => {
      if (!window.confirm(`„${label}“ wirklich löschen? Das lässt sich nicht rückgängig machen.`)) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(`/api/weddings/${id}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error(`Löschen fehlgeschlagen (${res.status})`);
        setForm(null);
        setList((current) => (current ? current.filter((item) => item.id !== id) : current));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setBusy(false);
      }
    },
    [router]
  );

  if (!ready) return null;

  return (
    <>
      {anchors.map((anchor) => (
        <EntryButtons
          key={anchor.id}
          anchor={anchor}
          onEdit={() => void openExisting(anchor.id)}
          onDelete={() => void remove(anchor.id, anchor.element.querySelector('h2')?.textContent ?? 'Diese Hochzeit')}
        />
      ))}

      <div className="fixed bottom-4 end-4 z-[190] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => void openList()}
          className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-black/80 px-4 py-2 text-xs font-medium text-gold shadow-lg backdrop-blur-sm transition-colors hover:bg-black"
        >
          <HeartHandshake className="size-3.5" />
          Hochzeiten verwalten
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setForm({ ...EMPTY_FORM });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold px-4 py-2 text-xs font-medium text-[var(--gold-ink)] shadow-lg transition-opacity hover:opacity-90"
        >
          <Plus className="size-3.5" />
          Hochzeit hinzufügen
        </button>
      </div>

      {list ? (
        <Dialog title="Alle Hochzeiten" eyebrow="Referenzen" onClose={() => setList(null)}>
          {list.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Noch keine Hochzeit angelegt.</p>
          ) : (
            <ul className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {list.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-surface-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">{item.coupleLabel}</span>
                    <span className="block text-xs text-ink-faint">
                      {[item.city, item.date, item.status === 'draft' ? 'Entwurf' : 'Veröffentlicht']
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => void openExisting(item.id)}
                      aria-label={`${item.coupleLabel} bearbeiten`}
                      className="rounded-full border border-line p-2 text-ink-muted transition-colors hover:text-ink"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(item.id, item.coupleLabel)}
                      aria-label={`${item.coupleLabel} löschen`}
                      className="rounded-full border border-line p-2 text-ink-muted transition-colors hover:text-danger"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        </Dialog>
      ) : null}

      {form ? (
        <Dialog
          title={form.id ? 'Hochzeit bearbeiten' : 'Neue Hochzeit'}
          eyebrow="Echte Hochzeiten"
          onClose={() => setForm(null)}
        >
          <div className="mt-5 flex-1 space-y-5 overflow-y-auto pe-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Paar *">
                <input
                  type="text"
                  value={form.coupleLabel}
                  onChange={(event) => setForm({ ...form, coupleLabel: event.target.value })}
                  placeholder="A. & B."
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Stadt">
                <input
                  type="text"
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  placeholder="Stuttgart"
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Location">
                <input
                  type="text"
                  value={form.venue}
                  onChange={(event) => setForm({ ...form, venue: event.target.value })}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Datum">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Gäste">
                <input
                  type="number"
                  min={1}
                  value={form.guestCount}
                  onChange={(event) => setForm({ ...form, guestCount: event.target.value })}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value === 'draft' ? 'draft' : 'published' })}
                  className={INPUT_CLASS}
                >
                  <option value="published">Veröffentlicht</option>
                  <option value="draft">Entwurf (nur für dich sichtbar)</option>
                </select>
              </Field>
            </div>

            <Field label="Titelbild">
              {form.cover ? (
                <PhotoTile
                  photo={form.cover}
                  onAltChange={(alt) => setForm({ ...form, cover: { ...form.cover!, alt } })}
                  onAltCommit={() => form.cover && void saveAlt(form.cover)}
                  onRemove={() => setForm({ ...form, cover: null })}
                />
              ) : null}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={busy}
                onChange={(event) => {
                  const files = event.target.files;
                  if (files?.length) void addFiles(files, 'cover');
                  event.target.value = '';
                }}
                className={FILE_CLASS}
              />
            </Field>

            <Field label={`Fotogalerie (${form.gallery.length})`}>
              {form.gallery.length > 0 ? (
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  {form.gallery.map((photo, index) => (
                    <PhotoTile
                      key={photo.mediaId}
                      photo={photo}
                      onAltChange={(alt) => {
                        const gallery = [...form.gallery];
                        gallery[index] = { ...photo, alt };
                        setForm({ ...form, gallery });
                      }}
                      onAltCommit={() => void saveAlt(form.gallery[index])}
                      onRemove={() => setForm({ ...form, gallery: form.gallery.filter((_, i) => i !== index) })}
                    />
                  ))}
                </div>
              ) : null}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                disabled={busy}
                onChange={(event) => {
                  const files = event.target.files;
                  if (files?.length) void addFiles(files, 'gallery');
                  event.target.value = '';
                }}
                className={FILE_CLASS}
              />
              <p className="mt-2 text-xs text-ink-faint">
                Mehrere Bilder auf einmal auswählbar. „Entfernen“ nimmt das Foto nur aus dieser Hochzeit — die Datei
                bleibt in der Mediathek.
              </p>
            </Field>

            <Field label={`Videos (${form.videos.length})`}>
              <div className="space-y-2">
                {form.videos.map((video, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <input
                        type="url"
                        value={video.url}
                        onChange={(event) => {
                          const videos = [...form.videos];
                          videos[index] = { ...video, url: event.target.value };
                          setForm({ ...form, videos });
                        }}
                        placeholder="https://www.youtube.com/watch?v=…"
                        className={INPUT_CLASS}
                      />
                      <input
                        type="text"
                        value={video.title}
                        onChange={(event) => {
                          const videos = [...form.videos];
                          videos[index] = { ...video, title: event.target.value };
                          setForm({ ...form, videos });
                        }}
                        placeholder="Bildunterschrift (optional), z. B. Einzug"
                        className={INPUT_CLASS}
                      />
                      {video.url.trim() && !looksLikeYouTube(video.url) ? (
                        <p className="text-xs text-danger">Kein YouTube-Link.</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, videos: form.videos.filter((_, i) => i !== index) })}
                      aria-label="Video entfernen"
                      className="mt-1 rounded-full border border-line p-2 text-ink-muted transition-colors hover:text-danger"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, videos: [...form.videos, { url: '', title: '' }] })}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
              >
                <Plus className="size-3.5" />
                YouTube-Link hinzufügen
              </button>
            </Field>

            <Field label="Text zur Hochzeit">
              <textarea
                value={form.story}
                onChange={(event) => setForm({ ...form, story: event.target.value })}
                rows={10}
                placeholder="Wie der Abend lief, was gespielt wurde, was besonders war …"
                className={`${INPUT_CLASS} resize-y`}
              />
              <p className="mt-2 text-xs text-ink-faint">
                Leerzeile = neuer Absatz, „## “ = Zwischenüberschrift, „- “ = Aufzählung, **fett**. Dieser Text und die
                Video-Bildunterschriften gelten für die aktuelle Sprache (<code>{locale}</code>) — für eine weitere
                Sprache die Seite in dieser Sprache aufrufen und hier erneut eintragen.
              </p>
            </Field>
          </div>

          {error ? <p className="mt-4 shrink-0 text-sm text-danger">{error}</p> : null}

          <div className="mt-5 flex shrink-0 items-center justify-between gap-3 border-t border-line pt-4">
            {form.id ? (
              <button
                type="button"
                onClick={() => void remove(form.id!, form.coupleLabel)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-danger"
              >
                <Trash2 className="size-3.5" />
                Löschen
              </button>
            ) : (
              <span />
            )}
            <span className="flex items-center gap-3">
              {busy ? <Loader2 className="size-4 animate-spin text-ink-muted" /> : null}
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-md border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={busy}
                className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[var(--gold-ink)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Speichern
              </button>
            </span>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}

const INPUT_CLASS =
  'w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-gold';
const FILE_CLASS =
  'block w-full text-sm text-ink-muted file:me-4 file:rounded-md file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--gold-ink)]';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-faint">{label}</span>
      {children}
    </label>
  );
}

function PhotoTile({
  photo,
  onAltChange,
  onAltCommit,
  onRemove,
}: {
  photo: EditorPhoto;
  onAltChange: (alt: string) => void;
  onAltCommit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="mb-3 rounded-md border border-line p-2">
      <div className="relative">
        {/* Bewusst `<img>`, nicht `next/image`: eine gerade hochgeladene Datei
            durch den Optimierer zu schicken, kostet einen Serverdurchlauf für
            eine Vorschau, die nur die Betreiberin für Sekunden sieht. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" className="h-32 w-full rounded object-cover" />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Entfernen"
          className="absolute end-1 top-1 rounded-full border border-line bg-black/70 p-1.5 text-white transition-colors hover:text-danger"
        >
          <X className="size-3" />
        </button>
      </div>
      <input
        type="text"
        value={photo.alt}
        onChange={(event) => onAltChange(event.target.value)}
        onBlur={onAltCommit}
        placeholder="Bildbeschreibung (Alt-Text)"
        className="mt-2 w-full rounded border border-line bg-surface-2 px-2 py-1 text-xs text-ink outline-none focus:border-gold"
      />
    </div>
  );
}

function Dialog({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}) {
  // Escape schließt — bei einem Formular dieser Länge ist der Schließen-Knopf
  // sonst regelmäßig aus dem Blick gescrollt.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-lg border border-line bg-surface p-6 shadow-xl">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">{eyebrow}</p>
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

/**
 * Die Knöpfe sitzen absolut positioniert *in* der jeweiligen Referenz, nicht
 * in einer eigenen Ebene über der Seite: So wandern sie beim Scrollen und bei
 * Layoutänderungen von selbst mit, statt per `getBoundingClientRect()`
 * nachgeführt werden zu müssen (gleiche Bauweise wie `SlotButton`).
 */
function EntryButtons({ anchor, onEdit, onDelete }: { anchor: Anchor; onEdit: () => void; onDelete: () => void }) {
  return createPortal(
    <span className="absolute end-0 top-0 z-50 flex gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-black/70 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur-sm transition-colors hover:bg-black/85"
      >
        <Pencil className="size-3.5" />
        Bearbeiten
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Hochzeit löschen"
        className="inline-flex items-center rounded-full border border-line bg-black/70 p-1.5 text-white backdrop-blur-sm transition-colors hover:text-danger"
      >
        <Trash2 className="size-3.5" />
      </button>
    </span>,
    anchor.element
  );
}
