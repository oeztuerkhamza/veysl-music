'use client';

import type { ReactNode } from 'react';
import { WhatsAppIcon } from '@/components/ui/social-icons';
import { useWhatsappModal } from './whatsapp-modal-provider';
import type { WhatsappSource } from '@/lib/whatsapp-flow';

/**
 * The `/kontakt` page's WhatsApp card — opens the shared pre-qualification
 * modal instead of linking to `wa.me` directly, like every other WhatsApp
 * entry point (see `whatsapp-modal-provider.tsx`). A thin client wrapper
 * around an otherwise server-rendered page.
 */
export function WhatsappCtaCard({
  source,
  title,
  text,
  className,
}: {
  source: WhatsappSource;
  title: ReactNode;
  text: ReactNode;
  className?: string;
}) {
  const { openWhatsappModal } = useWhatsappModal();

  return (
    <button type="button" onClick={() => openWhatsappModal(source)} className={className}>
      <WhatsAppIcon className="h-6 w-6 text-gold" />
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="text-sm text-ink-muted">{text}</p>
    </button>
  );
}
