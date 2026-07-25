'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { useTranslations } from 'next-intl';
import { hasConsentGatedProviders } from '@/lib/analytics/config';
import { requestConsentReopen } from '@/lib/analytics/consent';

/**
 * Always-available way to change analytics consent after the fact — DSGVO/
 * TTDSG requires this, not just the initial banner (its own copy promises
 * "jederzeit widerrufbar" / "revocable anytime" — `messages/de.json`
 * `consent.text`). Renders nothing if there's nothing to consent to in the
 * first place (Plausible-only deployments — the common case for this
 * project by default).
 *
 * Not mounted anywhere by this agent — see `docs/CRO-AUDIT.md` for the
 * one-line addition to `src/components/layout/footer.tsx`'s legal column
 * (owned by the layout agent), next to the Impressum/Datenschutz links.
 */
export function ConsentSettingsLink(props: Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'onClick'>) {
  const t = useTranslations('consent');
  if (!hasConsentGatedProviders()) return null;
  return (
    <button type="button" onClick={() => requestConsentReopen()} {...props}>
      {t('settings')}
    </button>
  );
}
