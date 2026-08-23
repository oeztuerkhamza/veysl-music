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
   * 301 statt 404, in allen acht Sprachen unter ihrem jeweiligen Slug. Die
   * Strategie bleibt unangetastet: Es entsteht keine konkurrierende Seite,
   * die Absicht landet nur dort, wo sie ohnehin hingehört.
   */
  async redirects() {
    const cityRoutes: Array<{ prefix: string; home: string }> = [
      { prefix: '/hochzeits-dj', home: '/' },
      { prefix: '/tr/dugun-dj', home: '/tr' },
      { prefix: '/ku/dj-dawete', home: '/ku' },
      // Arabisch kam später dazu als diese Liste entstand und fehlte hier —
      // `/ar/dj-afrah/stuttgart` lief damit als einzige Sprache weiter in den
      // 404, den alle anderen längst nicht mehr hatten.
      { prefix: '/ar/dj-afrah', home: '/ar' },
      { prefix: '/en/wedding-dj', home: '/en' },
      { prefix: '/nl/bruiloft-dj', home: '/nl' },
      { prefix: '/fr/dj-mariage', home: '/fr' },
      { prefix: '/es/dj-boda', home: '/es' },
    ];

    /**
     * Zusätzlich: `/hochzeits-dj` selbst lief ebenfalls in einen 404 — die
     * Route ist `/hochzeits-dj/[stadt]`, die Elternebene gab es nicht. Das ist
     * die zweite naheliegend geratene URL des Clusters, und seit August 2026
     * hat sie ein echtes Ziel: die Landesseite, die genau diese acht
     * Stadtseiten bündelt.
     *
     * Nur für die drei Sprachen mit Landesseite (BW_SUPPORTED_LOCALES). In den
     * übrigen bleibt es beim 404 — eine Weiterleitung auf eine Seite, die dort
     * `notFound()` liefert, wäre ein Umweg mit demselben Ende.
     */
    const clusterParents = [
      { source: '/hochzeits-dj', destination: '/hochzeits-dj-baden-wuerttemberg' },
      { source: '/tr/dugun-dj', destination: '/tr/dugun-dj-baden-wuerttemberg' },
      { source: '/en/wedding-dj', destination: '/en/wedding-dj-baden-wuerttemberg' },
    ];

    /**
     * Dieselbe geratene-Eltern-URL-Logik für die Türkisch-Nische: Wer
     * `/tuerkischer-dj` tippt oder verlinkt (die naheliegendste Kurzform der
     * Turkish-Slugs), landet auf der obersten Ebene der Nische statt im 404 —
     * seit es die Bundes-Seite gibt, ist DIE der semantische Elternknoten,
     * nicht mehr die BW-Landesseite. Nur die drei Sprachen mit Seite
     * (TURKISH_DJ_SUPPORTED_LOCALES) — gleiche Begründung wie bei
     * `clusterParents` oben.
     */
    const turkishClusterParents = [
      { source: '/tuerkischer-dj', destination: '/tuerkischer-dj-deutschland' },
      { source: '/tr/turk-dj', destination: '/tr/turk-dj-almanya' },
      { source: '/en/turkish-dj', destination: '/en/turkish-dj-germany' },
    ];

    /**
     * Die Musik-/Sets-Seite ist entfallen (Kundenentscheidung, August 2026).
     * Sie war zu diesem Zeitpunkt eine leere Hülle — alle sieben Sets in
     * `src/content/mixes.ts` haben `src: null`, alle drei Streaming-Profile in
     * `site.ts` sind leere Strings; die Seite zeigte also sieben
     * "Demnächst"-Player und eine Linkliste ohne Links.
     *
     * Trotzdem 301 statt 404: Die URL stand in der Sitemap, in beiden
     * Navigationen und in einem Dutzend interner Verweise, war also für Google
     * eine bekannte Adresse. Ziel ist die Galerie — die Seite, die inzwischen
     * das zeigt, was jemand hier eigentlich sucht: wie so ein Abend aussieht.
     *
     * Alle sieben Sprachen unter ihrem jeweiligen Slug, sonst greift die
     * Weiterleitung ausgerechnet für die Sprachen nicht, in denen die URL
     * anders hieß.
     */
    const retiredMusicRoutes = [
      { source: '/musik', destination: '/galerie' },
      { source: '/tr/muzik', destination: '/tr/galeri' },
      { source: '/ku/muzika', destination: '/ku/wene-u-video' },
      { source: '/en/music', destination: '/en/gallery' },
      { source: '/nl/muziek', destination: '/nl/fotos-videos' },
      { source: '/fr/musique', destination: '/fr/galerie-photos' },
      { source: '/es/musica', destination: '/es/galeria' },
    ];


    /**
     * Alt-URLs der Ratgeber-Artikel vor der Slug-Lokalisierung (August 2026).
     *
     * Bis dahin emittierten Sitemap und hreflang die tr/en-Artikel unter ihrem
     * DEUTSCHEN Slug (`/tr/rehber/<de-slug>`, `/en/guide/<de-slug>`) — Google
     * hat diese URLs gelernt, und seit die lokalisierten Slugs live sind,
     * meldet die Search Console sie als 404 („Not found", Coverage-Export
     * 2026-08-23: Teil der 128). Ein 301 auf den heutigen lokalisierten Slug
     * gibt jeder dieser bekannten Adressen ihr Ziel zurück, statt sie
     * auslaufen zu lassen. Quelle der Paare: `src/content/blog/*.ts`
     * (kanonischer `slug` + tr/en-Overrides) — `null` heißt: Slug ist in
     * dieser Sprache identisch, kein Redirect nötig. Die Phantom-Stadt-URLs
     * der nie ausgespielten Sprachen (ku/ar/nl/fr/es) bekommen dagegen
     * bewusst KEINEN Redirect: Dort gibt es kein gleichwertiges Ziel, und
     * ein 404 für nie existierende Inhalte ist die korrekte Antwort.
     */
    const legacyBlogSlugs: Array<{ de: string; tr: string | null; en: string | null }> = [
      { de: 'davul-zurna-halay-roman-havasi', tr: null, en: 'turkish-wedding-music-davul-zurna-halay' },
      { de: 'destination-wedding-dj-buchen', tr: 'yurt-disinda-dugun-dj', en: 'destination-wedding-dj-booking' },
      { de: 'deutsch-tuerkische-hochzeit-zwei-familien', tr: 'alman-turk-dugunu-iki-aile', en: 'german-turkish-wedding-two-families' },
      { de: 'dj-live-band-oder-beides', tr: 'dj-mi-canli-grup-mu', en: 'dj-live-band-or-both' },
      { de: 'dramaturgie-hochzeitsabend', tr: 'dugun-aksami-dramaturjisi', en: 'wedding-evening-dramaturgy' },
      { de: 'eroeffnungstanz-songauswahl', tr: 'acilis-dansi-sarki-secimi', en: 'first-dance-song-choice' },
      { de: 'freie-trauung-beschallung-mikrofone-wetter', tr: 'acik-hava-toreni-ses-mikrofon', en: 'outdoor-ceremony-sound-microphones' },
      { de: 'hochzeits-dj-checkliste', tr: 'dugun-dj-kontrol-listesi', en: 'wedding-dj-checklist' },
      { de: 'hochzeits-timeline-musterablauf', tr: 'dugun-zaman-cizelgesi-ornek-akis', en: 'wedding-timeline-example' },
      { de: 'islamische-hochzeit-planen', tr: 'islami-dugun-planlama', en: 'planning-an-islamic-wedding' },
      { de: 'kina-gecesi-henna-abend-planen', tr: 'kina-gecesi-planlama', en: 'kina-gecesi-henna-night-guide' },
      { de: 'laermschutz-sperrzeiten-baden-wuerttemberg', tr: 'gurultu-yonetmeligi-baden-wuerttemberg', en: 'noise-rules-baden-wuerttemberg' },
      { de: 'location-akustik-checkliste', tr: 'mekan-akustigi-kontrol-listesi', en: 'venue-acoustics-checklist' },
      { de: 'musikwuensche-no-go-liste', tr: 'muzik-istekleri-no-go-listesi', en: 'music-requests-no-go-list' },
      { de: 'tuerkische-hochzeit-ablauf-musik-timing', tr: 'turk-dugunu-akis-muzik-zamanlama', en: 'turkish-wedding-running-order-music' },
      { de: 'was-kostet-ein-hochzeits-dj', tr: 'dugun-dj-fiyatlari', en: 'wedding-dj-cost' },
    ];
    const legacyBlogRedirects = legacyBlogSlugs.flatMap((post) => [
      ...(post.tr ? [{ source: `/tr/rehber/${post.de}`, destination: `/tr/rehber/${post.tr}` }] : []),
      ...(post.en ? [{ source: `/en/guide/${post.de}`, destination: `/en/guide/${post.en}` }] : []),
    ]);

    return [
      ...cityRoutes.map(({ prefix, home }) => ({
        source: `${prefix}/stuttgart`,
        destination: home,
        permanent: true,
      })),
      ...clusterParents.map((entry) => ({ ...entry, permanent: true })),
      ...turkishClusterParents.map((entry) => ({ ...entry, permanent: true })),
      ...retiredMusicRoutes.map((entry) => ({ ...entry, permanent: true })),
      ...legacyBlogRedirects.map((entry) => ({ ...entry, permanent: true })),
    ];
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
    ];
  },
};

// withPayload wraps last so its Turbopack/webpack aliasing (needed for the
// admin panel at src/app/(payload)/**, see payload.config.ts) applies on
// top of the next-intl plugin rather than being overridden by it.
const withPayloadConfig = withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });

/**
 * `withPayload` hängt an `/:path*` — also an **jede** Seite dieser Site —
 * folgenden Satz Header:
 *
 *     Accept-CH:   Sec-CH-Prefers-Color-Scheme
 *     Vary:        Sec-CH-Prefers-Color-Scheme
 *     Critical-CH: Sec-CH-Prefers-Color-Scheme
 *
 * (nachzulesen in `node_modules/@payloadcms/next/dist/cjs/withPayload.cjs`)
 *
 * Die ersten beiden sind harmlos. `Critical-CH` ist es nicht: Es weist den
 * Browser an, die Anfrage **sofort zu verwerfen und mit dem angeforderten Hint
 * zu wiederholen**, wenn er ihn beim ersten Mal nicht mitgeschickt hat — und
 * das tut kein Browser beim allerersten Aufruf einer Domain. Jeder Erstbesuch
 * kostet damit eine komplette zusätzliche Runde: Verbindung, Anfrage, Antwort,
 * verworfen, alles noch einmal.
 *
 * Gemessen mit Lighthouse (Mobil) auf der Startseite: **612 ms**, ausgewiesen
 * unter „Avoid multiple page redirects" — vor dem ersten Byte, das jemand zu
 * sehen bekommt, und damit direkt in FCP und LCP.
 *
 * Payload braucht den Hint wirklich, aber nur für sich: `getRequestTheme`
 * (`@payloadcms/next`) entscheidet damit, ob das Admin-Panel hell oder dunkel
 * serverseitig gerendert wird. Das ist eine Frage über `/admin` — nicht über
 * die 267 öffentlichen Seiten, die ihre Themenwahl ohnehin über `next-themes`
 * im Browser treffen.
 *
 * Deshalb wird der von Payload erzeugte Block hier nicht entfernt, sondern
 * umgehängt: derselbe Header, nur auf `/admin/:path*` beschränkt. Erkannt wird
 * er am `Critical-CH`-Schlüssel, damit der eigene Sicherheits-Header-Block
 * oben (gleiche `source`, aber ohne diesen Schlüssel) unangetastet bleibt.
 */
const payloadHeaders = withPayloadConfig.headers;

withPayloadConfig.headers = async () => {
  const entries = payloadHeaders ? await payloadHeaders() : [];

  return entries.map((entry) =>
    entry.source === '/:path*' && entry.headers.some((header) => header.key === 'Critical-CH')
      ? { ...entry, source: '/admin/:path*' }
      : entry
  );
};

export default withPayloadConfig;
