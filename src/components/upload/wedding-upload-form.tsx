'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Film, ImageIcon, Loader2, Plus, Upload, X } from 'lucide-react';
import {
  CLIP_ACCEPT,
  MAX_CLIPS_PER_SUBMISSION,
  MAX_CLIP_BYTES,
  MAX_NOTE_LENGTH,
  MAX_PHOTOS_PER_SUBMISSION,
  MAX_PHOTO_BYTES,
  MAX_TOTAL_BYTES,
  MAX_YOUTUBE_URLS_PER_SUBMISSION,
  PHOTO_ACCEPT,
  formatMegabytes,
  isAllowedClip,
  isAllowedPhoto,
} from '@/lib/wedding-upload';

/**
 * Das Formular, das ein Brautpaar auf `/fotos/<token>` ausfüllt.
 *
 * Die Zielgruppe ist hier eine andere als sonst im Projekt: keine Besucherin,
 * die sich informiert, sondern jemand, der auf dem Handy in einer
 * WhatsApp-Weiterleitung gelandet ist und dreißig Bilder aus der Kamerarolle
 * schicken will. Danach ist alles ausgelegt — ein Bildschirm, keine Schritte,
 * keine Anmeldung, und die Auswahl bleibt änderbar, bis abgeschickt wird.
 *
 * Alle Grenzen werden hier schon geprüft, obwohl die Route sie ohnehin prüft.
 * Das ist keine doppelte Sicherheit — die Prüfung im Browser ist keine
 * Sicherheit, sie ist Höflichkeit: Eine 300-MB-Datei erst nach vier Minuten
 * mobilem Upload abzulehnen, ist die schlechteste Art, „zu groß“ zu sagen.
 */

interface PickedFile {
  file: File;
  /** Nur für Fotos — `URL.createObjectURL`, damit die Vorschau ohne Upload entsteht. */
  previewUrl?: string;
}

const INPUT_CLASS =
  'w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-base text-ink outline-none transition-colors focus:border-gold';

export function WeddingUploadForm({ token }: { token: string }) {
  const t = useTranslations('upload');

  const [photos, setPhotos] = useState<PickedFile[]>([]);
  const [clips, setClips] = useState<PickedFile[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ photos: number; clips: number } | null>(null);

  const photoInput = useRef<HTMLInputElement>(null);
  const clipInput = useRef<HTMLInputElement>(null);

  const totalBytes = useMemo(
    () => [...photos, ...clips].reduce((sum, picked) => sum + picked.file.size, 0),
    [photos, clips]
  );

  const addPhotos = useCallback(
    (list: FileList) => {
      setError(null);
      const accepted: PickedFile[] = [];
      for (const file of Array.from(list)) {
        if (!isAllowedPhoto(file.type)) {
          setError(t('errors.photoType', { name: file.name }));
          continue;
        }
        if (file.size > MAX_PHOTO_BYTES) {
          setError(t('errors.photoSize', { name: file.name, max: formatMegabytes(MAX_PHOTO_BYTES) }));
          continue;
        }
        accepted.push({ file, previewUrl: URL.createObjectURL(file) });
      }
      setPhotos((current) => {
        const merged = [...current, ...accepted];
        if (merged.length > MAX_PHOTOS_PER_SUBMISSION) {
          setError(t('errors.photoCount', { max: MAX_PHOTOS_PER_SUBMISSION }));
          // Die überzähligen Vorschauen wieder freigeben, sonst hält der
          // Browser Speicher für Bilder, die nie angezeigt werden.
          merged.slice(MAX_PHOTOS_PER_SUBMISSION).forEach((picked) => {
            if (picked.previewUrl) URL.revokeObjectURL(picked.previewUrl);
          });
          return merged.slice(0, MAX_PHOTOS_PER_SUBMISSION);
        }
        return merged;
      });
    },
    [t]
  );

  const addClips = useCallback(
    (list: FileList) => {
      setError(null);
      const accepted: PickedFile[] = [];
      for (const file of Array.from(list)) {
        if (!isAllowedClip(file.type)) {
          setError(t('errors.clipType', { name: file.name }));
          continue;
        }
        if (file.size > MAX_CLIP_BYTES) {
          setError(t('errors.clipSize', { name: file.name, max: formatMegabytes(MAX_CLIP_BYTES) }));
          continue;
        }
        accepted.push({ file });
      }
      setClips((current) => {
        const merged = [...current, ...accepted];
        if (merged.length > MAX_CLIPS_PER_SUBMISSION) {
          setError(t('errors.clipCount', { max: MAX_CLIPS_PER_SUBMISSION }));
          return merged.slice(0, MAX_CLIPS_PER_SUBMISSION);
        }
        return merged;
      });
    },
    [t]
  );

  const submit = useCallback(async () => {
    if (photos.length === 0 && clips.length === 0 && youtubeUrls.filter(Boolean).length === 0 && !note.trim()) {
      setError(t('errors.empty'));
      return;
    }
    if (totalBytes > MAX_TOTAL_BYTES) {
      setError(t('errors.total', { max: formatMegabytes(MAX_TOTAL_BYTES) }));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('token', token);
      body.append('submitterName', name);
      body.append('note', note);
      photos.forEach((picked) => body.append('photos', picked.file));
      clips.forEach((picked) => body.append('clips', picked.file));
      youtubeUrls.filter(Boolean).forEach((url) => body.append('youtubeUrls', url));

      const res = await fetch('/api/wedding-upload', { method: 'POST', body });
      if (!res.ok) {
        const detail = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(t(`errors.server.${detail?.error ?? 'server_error'}`));
      }

      photos.forEach((picked) => picked.previewUrl && URL.revokeObjectURL(picked.previewUrl));
      setDone({ photos: photos.length, clips: clips.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.server.server_error'));
    } finally {
      setBusy(false);
    }
  }, [clips, name, note, photos, t, token, totalBytes, youtubeUrls]);

  if (done) {
    return (
      <div className="mt-10 rounded-lg border border-line bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto size-8 text-gold" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl text-ink">{t('done.title')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {t('done.text', { photos: done.photos, clips: done.clips })}
        </p>
        <button
          type="button"
          onClick={() => {
            setPhotos([]);
            setClips([]);
            setYoutubeUrls([]);
            setNote('');
            setDone(null);
          }}
          className="mt-6 rounded-md border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          {t('done.again')}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      {/* --- Fotos ---------------------------------------------------------- */}
      <section>
        <h2 className="font-display text-xl text-ink">{t('photos.title')}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {t('photos.hint', { max: MAX_PHOTOS_PER_SUBMISSION, size: formatMegabytes(MAX_PHOTO_BYTES) })}
        </p>

        {photos.length > 0 ? (
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((picked, index) => (
              <li key={`${picked.file.name}-${index}`} className="relative">
                {/* Bewusst `<img>`: die Datei ist noch gar nicht hochgeladen,
                    `next/image` hätte hier nichts zu optimieren. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={picked.previewUrl} alt="" className="aspect-square w-full rounded object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    if (picked.previewUrl) URL.revokeObjectURL(picked.previewUrl);
                    setPhotos((current) => current.filter((_, i) => i !== index));
                  }}
                  aria-label={t('remove')}
                  className="absolute end-1 top-1 rounded-full bg-black/70 p-1 text-white transition-colors hover:text-danger"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <input
          ref={photoInput}
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) addPhotos(event.target.files);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => photoInput.current?.click()}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-line px-4 py-3 text-sm text-ink transition-colors hover:border-gold"
        >
          <ImageIcon className="size-4" />
          {photos.length > 0 ? t('photos.addMore') : t('photos.choose')}
        </button>
      </section>

      {/* --- Videos --------------------------------------------------------- */}
      <section>
        <h2 className="font-display text-xl text-ink">{t('clips.title')}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {t('clips.hint', { max: MAX_CLIPS_PER_SUBMISSION, size: formatMegabytes(MAX_CLIP_BYTES) })}
        </p>

        {clips.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {clips.map((picked, index) => (
              <li
                key={`${picked.file.name}-${index}`}
                className="flex items-center gap-3 rounded-md border border-line px-3 py-2"
              >
                <Film className="size-4 shrink-0 text-gold" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{picked.file.name}</span>
                <span className="shrink-0 text-xs text-ink-faint">{formatMegabytes(picked.file.size)}</span>
                <button
                  type="button"
                  onClick={() => setClips((current) => current.filter((_, i) => i !== index))}
                  aria-label={t('remove')}
                  className="shrink-0 rounded-full border border-line p-1.5 text-ink-muted transition-colors hover:text-danger"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <input
          ref={clipInput}
          type="file"
          accept={CLIP_ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) addClips(event.target.files);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => clipInput.current?.click()}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-line px-4 py-3 text-sm text-ink transition-colors hover:border-gold"
        >
          <Film className="size-4" />
          {t('clips.choose')}
        </button>

        {/* --- YouTube -------------------------------------------------------- */}
        <div className="mt-6">
          <p className="text-sm text-ink-muted">{t('youtube.hint')}</p>
          <div className="mt-3 space-y-2">
            {youtubeUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="url"
                  inputMode="url"
                  value={url}
                  onChange={(event) => {
                    const next = [...youtubeUrls];
                    next[index] = event.target.value;
                    setYoutubeUrls(next);
                  }}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  onClick={() => setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index))}
                  aria-label={t('remove')}
                  className="shrink-0 rounded-full border border-line p-2 text-ink-muted transition-colors hover:text-danger"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          {youtubeUrls.length < MAX_YOUTUBE_URLS_PER_SUBMISSION ? (
            <button
              type="button"
              onClick={() => setYoutubeUrls([...youtubeUrls, ''])}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
            >
              <Plus className="size-3.5" />
              {t('youtube.add')}
            </button>
          ) : null}
        </div>
      </section>

      {/* --- Wer schickt das, und was möchte er sagen ------------------------ */}
      <section className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm text-ink">{t('name.label')}</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('name.placeholder')}
            className={INPUT_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-ink">{t('note.label')}</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, MAX_NOTE_LENGTH))}
            rows={5}
            placeholder={t('note.placeholder')}
            className={`${INPUT_CLASS} resize-y`}
          />
        </label>
      </section>

      {/*
        Die Einwilligung ist kein Kleingedrucktes, sondern der Grund, warum
        diese Seite überhaupt so gebaut werden darf: Auf Hochzeitsfotos sind
        Gäste erkennbar, und die Veröffentlichung braucht deren Einverständnis
        (Recht am eigenen Bild / DSGVO). Wer den Haken nicht setzt, kann nicht
        absenden — und selbst dann entscheidet immer noch der Betreiber, was
        tatsächlich online geht.
      */}
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--gold)]"
        />
        <span className="text-sm leading-relaxed text-ink-muted">{t('consent')}</span>
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy || !consent}
          className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-base font-medium text-[var(--gold-ink)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {busy ? t('sending') : t('send')}
        </button>
        {totalBytes > 0 ? (
          <span className="text-sm text-ink-faint">{t('total', { size: formatMegabytes(totalBytes) })}</span>
        ) : null}
      </div>

      {busy ? <p className="text-sm text-ink-muted">{t('sendingHint')}</p> : null}
    </div>
  );
}
