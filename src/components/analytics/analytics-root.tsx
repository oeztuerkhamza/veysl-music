import { AnalyticsScripts } from './analytics-scripts';
import { AutoTrack } from './auto-track';
import { ConsentBanner } from './consent-banner';

/**
 * Single mount point for the whole analytics layer — provider bootstrap,
 * automatic behavioural instrumentation, and the consent prompt. Rendering
 * this once near the root is the ONE change this agent needs from the
 * layout agent's file; see `docs/ANALYTICS.md`.
 *
 * ```tsx
 * // src/app/[locale]/layout.tsx
 * import { AnalyticsRoot } from '@/components/analytics';
 * // …inside <body>, anywhere — it renders no visible chrome of its own
 * // except the consent banner, which is already `position: fixed`:
 * <AnalyticsRoot />
 * ```
 */
export function AnalyticsRoot() {
  return (
    <>
      <AnalyticsScripts />
      <AutoTrack />
      <ConsentBanner />
    </>
  );
}
