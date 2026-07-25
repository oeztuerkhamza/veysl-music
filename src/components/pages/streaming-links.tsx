import type { ComponentType } from 'react';
import { Music2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { site } from '@/content/site';
import { Reveal } from '@/components/motion/reveal';
// lucide-react ships no brand/logo icons — real inline-SVG brand marks live
// in the layout agent's src/components/ui/social-icons.tsx instead.
import { InstagramIcon, SpotifyIcon, TikTokIcon, YouTubeIcon } from '@/components/ui/social-icons';

/** Only the platform keys that make sense in a "listen/follow" strip — googleMaps is excluded on purpose. */
const PLATFORM_KEYS = ['instagram', 'youtube', 'tiktok', 'spotify', 'soundcloud', 'mixcloud'] as const;

type IconComponent = ComponentType<{ className?: string }>;

// SoundCloud/Mixcloud have no brand mark yet — Music2 (generic) is a
// deliberate, honest fallback rather than a mismatched borrowed logo.
const PLATFORM_ICONS: Record<(typeof PLATFORM_KEYS)[number], IconComponent> = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  spotify: SpotifyIcon,
  soundcloud: Music2,
  mixcloud: Music2,
};

// Brand names are literal, not translated prose — same convention already
// used by the audio agent's TrackCard (EXTERNAL_PLATFORMS).
const PLATFORM_LABELS: Record<(typeof PLATFORM_KEYS)[number], string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  mixcloud: 'Mixcloud',
};

/** Renders only the platforms with a real, non-empty URL in site.social. */
export async function StreamingLinks() {
  const t = await getTranslations('music');
  const active = PLATFORM_KEYS.filter((key) => Boolean(site.social[key]));

  if (active.length === 0) return null;

  return (
    <Reveal>
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">{t('streamingTitle')}</p>
        <div className="flex flex-wrap gap-3">
          {active.map((key) => {
            const Icon = PLATFORM_ICONS[key];
            const label = PLATFORM_LABELS[key];
            return (
              <a
                key={key}
                href={site.social[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('player.listenOn', { platform: label })}
                className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
