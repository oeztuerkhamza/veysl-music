import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Origin of the Plausible script, derived from the same env var the client
 * reads (`src/lib/analytics/config.ts`). Hardcoding `plausible.io` would break
 * the self-hosted setup that variable exists to allow, and a CSP that blocks
 * analytics fails silently — no error, just no data.
 */
function plausibleOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js';
  try {
    return new URL(configured).origin;
  } catch {
    return 'https://plausible.io';
  }
}

/**
 * Content-Security-Policy. There was none before: without it the site had no
 * defence against injected script and — more concretely — no `frame-ancestors`,
 * so any page could be framed and clickjacked, including the enquiry form and
 * the Payload login.
 *
 * Every origin below is one this codebase actually requests; nothing is
 * allowed "just in case":
 *   - Plausible (consent-free), GA4 via googletagmanager, Clarity — all three
 *     are opt-in and only load after consent (src/lib/analytics/*), but the
 *     policy has to permit them or the consent flow would grant nothing.
 *   - YouTube (`youtube-nocookie`) and Instagram only in `frame-src`: both are
 *     click-to-load facades (`video-facade.tsx`, `showreel-facade.tsx`), so
 *     nothing third-party is requested until a visitor asks for it.
 *   - The image hosts mirror `images.remotePatterns` below, plus `blob:`/`data:`
 *     which next/image and the WebGL canvas both need.
 *
 * `script-src` carries `'unsafe-inline'` deliberately. The App Router emits an
 * inline bootstrap script into every document; the alternative — a per-request
 * nonce set in middleware — forces dynamic rendering, which would turn all 187
 * statically prerendered pages into server-rendered ones. Trading the entire
 * static build for a directive that `'unsafe-inline'` only partially weakens
 * is the wrong side of that deal for a brochure site with no user accounts on
 * the public surface.
 *
 * `'unsafe-eval'` is granted in development ONLY. Next's dev server compiles
 * React Fast Refresh updates through `eval`, so a policy without it turns
 * every hot reload into a silent console error and makes `npm run dev`
 * effectively unusable — while production, which is the only environment an
 * attacker sees, still refuses `eval` outright.
 */
const isDev = process.env.NODE_ENV === 'development';

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${plausibleOrigin()} https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.scdn.co https://i1.sndcdn.com https://thumbnailer.mixcloud.com https://lh3.googleusercontent.com https://i.ytimg.com https://www.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms https://c.bing.com",
  "font-src 'self' data:",
  // Mixe liegen als lokale Dateien unter /audio (src/content/mixes.ts).
  "media-src 'self'",
  `connect-src 'self' ${plausibleOrigin()} https://www.google-analytics.com https://*.google-analytics.com https://*.clarity.ms https://c.bing.com`,
  'frame-src https://www.youtube-nocookie.com https://www.youtube.com https://www.instagram.com',
  // three.js/Payload können Worker aus Blobs starten.
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  // Self-contained server build for the Docker image — see Dockerfile.
  // Added for production deployment (deploy/, Dockerfile); the only
  // application-source change made as part of that work.
  output: 'standalone',
  // No `X-Powered-By: Next.js` on every response. It tells an attacker which
  // framework and therefore which CVE list to work through, and buys nothing.
  poweredByHeader: false,
  images: {
    // AVIF zuerst — siehe Projektplan A.9.1 "Ultra Performance"
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' }, // Spotify Cover
      { protocol: 'https', hostname: 'i1.sndcdn.com' }, // SoundCloud
      { protocol: 'https', hostname: 'thumbnailer.mixcloud.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google-Reviews-Avatare
    ],
  },
  // Required alongside `output: 'standalone'` — without these, the built-in
  // standalone server.js mis-resolves next-intl's middleware rewrite for
  // "/" and every localized route into an infinite 307 self-redirect
  // (confirmed locally: `next start` is fine, `node server.js` loops
  // without this). Documented Next.js guidance for self-hosted/custom
  // servers with middleware. See docs/DEPLOYMENT.md "Known issues".
  skipProxyUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'gsap'],
  },
  /**
   * Stuttgart hat als einzige Stadt im Einzugsgebiet **keine** eigene
   * Stadtseite — `src/content/cities.ts` hält sie mit `priority: 3` bewusst
   * zurück, weil die Startseite selbst auf „Hochzeits-DJ Stuttgart" zielt und
   * eine zweite Seite dieselbe Absicht kannibalisieren würde.
   *
   * Die Entscheidung stimmt, die Folge war unbeabsichtigt: `/hochzeits-dj/
   * stuttgart` lieferte **404**, während 49 andere Städte unter genau diesem
   * Muster erreichbar sind. Das ist die URL, die ein Mensch rät und die ein
   * Verzeichnis oder eine Wettbewerberseite verlinkt — und jeder Link darauf
   * lief in eine Sackgasse, statt der Startseite zugutezukommen.
   *
   * 301 statt 404, in allen sieben Sprachen unter ihrem jeweiligen Slug. Die
   * Strategie bleibt unangetastet: Es entsteht keine konkurrierende Seite,
   * die Absicht landet nur dort, wo sie ohnehin hingehört.
   */
  async redirects() {
    const cityRoutes: Array<{ prefix: string; home: string }> = [
      { prefix: '/hochzeits-dj', home: '/' },
      { prefix: '/tr/dugun-dj', home: '/tr' },
      { prefix: '/ku/dj-dawete', home: '/ku' },
      { prefix: '/en/wedding-dj', home: '/en' },
      { prefix: '/nl/bruiloft-dj', home: '/nl' },
      { prefix: '/fr/dj-mariage', home: '/fr' },
      { prefix: '/es/dj-boda', home: '/es' },
    ];

    return cityRoutes.map(({ prefix, home }) => ({
      source: `${prefix}/stuttgart`,
      destination: home,
      permanent: true,
    }));
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
        ],
      },
      /**
       * Keep the Payload admin out of the search index.
       *
       * It was reachable and indexable: nginx proxies everything to the app
       * (nginx/nginx.conf says so explicitly), `robots.ts` allows `/`, and
       * Payload's own `generatePageMetadata` emits no robots directive —
       * verified in node_modules/@payloadcms/next/dist/utilities/meta.js,
       * which sets only title/icons. Nothing anywhere said "do not index the
       * login screen".
       *
       * This is hygiene, not a security fix: the panel is authenticated, and
       * robots directives never protect anything. What an indexed admin login
       * does buy you is a discoverable target for credential-stuffing bots and
       * a non-content URL sitting in `site:dj-veys.de` results.
       *
       * Deliberately a header and NOT a `Disallow: /admin` in robots.ts. Those
       * two look interchangeable and are not: `Disallow` blocks *crawling*, so
       * a URL Google learns about elsewhere can still be listed URL-only —
       * and, worse, a crawler forbidden to fetch the page can never see the
       * `noindex` telling it to stay out. Allowing the crawl and answering
       * `noindex` is the combination that actually removes it.
       *
       * `/admin/:path*` alone would miss `/admin` itself, so both are listed.
       */
      ...['/admin', '/admin/:path*'].map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
    ];
  },
};

// withPayload wraps last so its Turbopack/webpack aliasing (needed for the
// admin panel at src/app/(payload)/**, see payload.config.ts) applies on
// top of the next-intl plugin rather than being overridden by it.
export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });
