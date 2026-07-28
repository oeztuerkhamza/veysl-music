import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
        ],
      },
    ];
  },
};

// withPayload wraps last so its Turbopack/webpack aliasing (needed for the
// admin panel at src/app/(payload)/**, see payload.config.ts) applies on
// top of the next-intl plugin rather than being overridden by it.
export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });
