import type { LucideIcon } from 'lucide-react';
import { Camera } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { ASPECT_RATIO_CSS, type SlotAspect } from './aspect';

export interface ImagePlaceholderProps {
  aspect: SlotAspect;
  icon?: LucideIcon;
  /** Visible caption. Omit for the shared "coming soon" copy, pass `null` to render no caption at all (compact/small placeholders). */
  caption?: string | null;
  /** Circle instead of rounded panel — for avatar-shaped slots (`aspect="1/1"`). */
  shape?: 'panel' | 'circle';
  className?: string;
  /**
   * Slot-Kennung für die Vor-Ort-Bildbearbeitung — durchgereicht von
   * `<SiteImage>`. Gerade der leere Zustand braucht sie am dringendsten: Das
   * ist die Fläche, auf der noch gar kein Foto liegt.
   */
  'data-cms-slot'?: string;
}

/**
 * The designed "no photo yet" state every `<SiteImage>`/`<MediaFigure>` falls
 * back to — see `.claude/BRAND-FACTS.md` "Media": this must read as an
 * intentional editorial element, not a gap, with zero external assets (same
 * discipline as `<ShowreelFacade>` and `<EmptyState>` elsewhere on the site).
 *
 * Deliberately varies by orientation rather than using one identical box
 * everywhere: wide bands (21/9, 16/9) get a low, wide glow reminiscent of
 * stage light spilling up from a dance floor; tall/square tiles get a
 * centered top glow reminiscent of a portrait vignette. Never literal
 * imagery — just gold, grain and light, consistent with the rest of the
 * design system.
 */
export async function ImagePlaceholder({
  aspect,
  icon: Icon = Camera,
  caption,
  shape = 'panel',
  className,
  'data-cms-slot': cmsSlot,
}: ImagePlaceholderProps) {
  const t = await getTranslations('media');
  const label = caption === null ? null : (caption ?? t('comingSoon'));
  const isWide = aspect === '21/9' || aspect === '16/9';
  const isCircle = shape === 'circle';

  return (
    <div
      role="img"
      aria-label={t('placeholderAriaLabel')}
      data-cms-slot={cmsSlot}
      className={cn(
        'grain relative isolate flex w-full items-center justify-center overflow-hidden border border-line bg-gradient-to-b from-surface to-surface-2',
        isCircle ? 'rounded-full' : 'rounded-lg',
        className
      )}
      style={{ aspectRatio: ASPECT_RATIO_CSS[aspect] }}
    >
      {!isCircle ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        />
      ) : null}

      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 opacity-40',
          isWide
            ? 'bg-[radial-gradient(ellipse_at_50%_120%,var(--color-glow),transparent_60%)]'
            : 'bg-[radial-gradient(circle_at_50%_20%,var(--color-glow),transparent_65%)]'
        )}
      />

      <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
        <span
          aria-hidden="true"
          className={cn(
            'flex items-center justify-center rounded-full border border-gold/40 text-gold',
            isWide ? 'h-12 w-12' : 'h-10 w-10'
          )}
        >
          <Icon className={isWide ? 'h-5 w-5' : 'h-4 w-4'} />
        </span>
        {label ? <p className="max-w-[16rem] text-xs uppercase tracking-[0.15em] text-ink-faint">{label}</p> : null}
      </div>
    </div>
  );
}
