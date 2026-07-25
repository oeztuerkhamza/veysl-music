'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { WhatsappSource } from '@/lib/whatsapp-flow';
import { WhatsappPrequalifyModal } from './whatsapp-prequalify-modal';

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
  const [source, setSource] = useState<WhatsappSource>('fab');
  const triggerRef = useRef<HTMLElement | null>(null);

  const openWhatsappModal = useCallback((nextSource: WhatsappSource) => {
    triggerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    setSource(nextSource);
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
      <WhatsappPrequalifyModal open={open} onClose={handleClose} whatsappNumber={whatsappNumber} source={source} />
    </WhatsappModalContext.Provider>
  );
}
