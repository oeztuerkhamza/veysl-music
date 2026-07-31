'use client';

import dynamic from 'next/dynamic';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { WhatsappSource } from '@/lib/whatsapp-flow';

/**
 * Erst beim Öffnen laden, nicht beim Seitenaufruf.
 *
 * Der Provider hängt im Root-Layout, also lag das Modal auf **jeder** Seite im
 * Startbündel — und mit ihm seine Abhängigkeitskette bis zu `zod` (allein
 * 304 KB unminifiziert, gemessen auf der Startseite). Bezahlt wurde das von
 * jedem Besucher, benutzt wird es nur von denen, die tatsächlich auf einen
 * WhatsApp-Einstieg tippen.
 *
 * `ssr: false` ist hier kein Kompromiss: Das Modal startet geschlossen und
 * rendert serverseitig ohnehin nichts Sichtbares. Der Import-Typ bleibt
 * statisch geprüft — es ist ein echter `import()`, kein `require` auf gut Glück.
 */
const WhatsappPrequalifyModal = dynamic(
  () => import('./whatsapp-prequalify-modal').then((m) => m.WhatsappPrequalifyModal),
  { ssr: false },
);

interface WhatsappModalContextValue {
  /** Opens the shared pre-qualification modal. `source` is stored with the captured lead for triage. */
  openWhatsappModal: (source: WhatsappSource) => void;
}

const WhatsappModalContext = createContext<WhatsappModalContextValue | null>(null);

/** Every WhatsApp entry point (FAB, sticky CTA bar, contact page, booking success panel) calls this instead of linking to `wa.me` directly. */
export function useWhatsappModal(): WhatsappModalContextValue {
  const ctx = useContext(WhatsappModalContext);
  if (!ctx) {
    throw new Error('useWhatsappModal must be used within <WhatsappModalProvider>');
  }
  return ctx;
}

/**
 * Mounted once in `src/app/[locale]/layout.tsx` so every page shares one
 * modal instance and one `sessionStorage`-backed answer set. Renders nothing
 * visible itself besides the (initially closed) modal.
 */
export function WhatsappModalProvider({ whatsappNumber, children }: { whatsappNumber: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  /**
   * Bleibt nach dem ersten Öffnen `true`, damit das Modal beim Schließen nicht
   * wieder ausgehängt (und beim nächsten Tippen erneut nachgeladen) wird. Erst
   * dieser Schalter macht das dynamische Laden oben wirksam: würde das Modal
   * unbedingt gerendert, zöge `next/dynamic` seinen Chunk sofort beim Mounten —
   * also wieder auf jeder Seite.
   */
  const [mounted, setMounted] = useState(false);
  const [source, setSource] = useState<WhatsappSource>('fab');
  const triggerRef = useRef<HTMLElement | null>(null);

  const openWhatsappModal = useCallback((nextSource: WhatsappSource) => {
    triggerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    setSource(nextSource);
    setMounted(true);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Return focus to whatever opened the modal — required for a11y, and
    // the whole point of "focus returned to the FAB on close" in the brief.
    triggerRef.current?.focus?.();
  }, []);

  const value = useMemo(() => ({ openWhatsappModal }), [openWhatsappModal]);

  return (
    <WhatsappModalContext.Provider value={value}>
      {children}
      {mounted ? (
        <WhatsappPrequalifyModal open={open} onClose={handleClose} whatsappNumber={whatsappNumber} source={source} />
      ) : null}
    </WhatsappModalContext.Provider>
  );
}
