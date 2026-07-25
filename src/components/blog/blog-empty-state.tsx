import type { LucideIcon } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

export interface BlogEmptyStateProps {
  locale: Locale;
  icon?: LucideIcon;
}

/**
 * Designed "not translated yet" state for `/ratgeber` in locales without
 * real articles (`ku`/`nl`/`fr`/`es` — see `BLOG_LOCALES` in
 * `src/content/blog/types.ts`). Same visual language as
 * `src/components/pages/empty-state.tsx` (gold hairline, serif message, icon
 * badge) but that shared component only supports one CTA
 * (`ctaHref?: '/anfrage' | '/kontakt'`) — the brief specifically asks for two
 * (`/fragen` and `/anfrage`), so this is a local, purpose-built variant
 * rather than an edit to a `pages`-agent-owned file.
 */
export async function BlogEmptyState({ locale, icon: Icon = BookOpen }: BlogEmptyStateProps) {
  const t = await getTranslations({ locale, namespace: 'blog.index.empty' });

  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-lg border border-line bg-gradient-to-b from-surface to-surface-2 px-8 py-16 text-center sm:py-20">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold"
        >
          <Icon className="h-6 w-6" />
        </div>
        <p className="mx-auto max-w-md text-balance font-display text-xl leading-relaxed text-ink sm:text-2xl">{t('title')}</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">{t('body')}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/fragen" variant="secondary" size="md">
            {t('questionsCta')}
          </Button>
          <Button href="/anfrage" variant="gold" size="md">
            {t('requestCta')}
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
