'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

// No real store to subscribe to — this is only ever used for its
// server/client snapshot mismatch (see `mounted` below).
const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();

  // Avoid a hydration mismatch: the server can't know the resolved theme
  // (it depends on localStorage / system preference), so render a neutral
  // placeholder until we're mounted on the client. `useSyncExternalStore`
  // reports `false` for the server render and the first (matching) client
  // render, then React itself re-checks the snapshot right after hydration
  // and flips it to `true` — same "mounted" two-pass render as before, just
  // without a setState call inside the effect body.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return <span className="inline-block h-11 w-11" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggle')}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition-colors duration-300 hover:text-ink"
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
