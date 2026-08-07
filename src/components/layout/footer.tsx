import type { ComponentType } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { InstagramIcon, WhatsAppIcon, YouTubeIcon, type SocialIconProps } from '@/components/ui/social-icons';
import { getSite } from '@/content/get-site';
import { ISLAMIC_SUPPORTED_LOCALES } from '@/content/islamic';
import { BW_SUPPORTED_LOCALES } from '@/content/region-bw';
import { TURKISH_DJ_SUPPORTED_LOCALES } from '@/content/turkish-dj';
import { localized } from '@/lib/utils';

/**
 * Mirrors the header's overlay list plus `/hochzeits-dj-europa`, which the
 * header deliberately does not carry (it is a reach page, not a primary
 * journey) but which otherwise had no inbound link outside its own country
 * pages — a closed loop no crawler and no reader could enter. The answer hub
 * and the guide index were in the same position; see the note on `NAV_ITEMS`
 * in header.tsx for why that mattered.
 */
const NAV_LINKS = [
  { href: '/hochzeit-events', key: 'services' },
  // Die beiden Geld-Seiten des Städte-Clusters. Bis August 2026 war die
  // BW-Landesseite ein kompletter Verwaisten-Fall — null interne Links
  // sitewide (SEO-Audit); der Footer ist ihr garantierter Einstiegspunkt.
  { href: '/hochzeits-dj-baden-wuerttemberg', key: 'badenWuerttemberg', locales: BW_SUPPORTED_LOCALES },
  { href: '/tuerkischer-dj-stuttgart', key: 'turkishDj', locales: TURKISH_DJ_SUPPORTED_LOCALES },
  { href: '/islamische-hochzeit', key: 'islamicWedding', locales: ISLAMIC_SUPPORTED_LOCALES },
  { href: '/pakete', key: 'packages' },
  { href: '/echte-hochzeiten', key: 'weddings' },
  { href: '/ablauf', key: 'process' },
  { href: '/fragen', key: 'questions' },
  { href: '/ratgeber', key: 'guide' },
  { href: '/hochzeits-dj-europa', key: 'europe' },
  { href: '/galerie', key: 'gallery' },
  { href: '/epk', key: 'epk' },
  { href: '/kontakt', key: 'contact' },
] as const satisfies ReadonlyArray<{ href: string; key: string; locales?: readonly Locale[] }>;

const linkClasses = 'text-sm text-ink-muted transition-colors duration-300 hover:text-ink';
const columnTitleClasses = 'text-xs font-semibold uppercase tracking-[0.15em] text-ink-faint';

export async function Footer() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const year = new Date().getFullYear();
  // CMS-editable contact/social/service-area data, falling back to
  // src/content/site.ts when the CMS has nothing set — see get-site.ts.
  const site = await getSite();
  const whatsappHref = `https://wa.me/${site.contact.whatsapp}`;

  // Render only the platforms the client actually has a profile for —
  // tiktok/spotify/soundcloud/mixcloud are empty strings today.
  type SocialLink = { href: string; label: string; Icon: ComponentType<SocialIconProps> };
  const socialLinkCandidates: (SocialLink | null)[] = [
    site.social.instagram ? { href: site.social.instagram, label: 'Instagram', Icon: InstagramIcon } : null,
    site.social.youtube ? { href: site.social.youtube, label: 'YouTube', Icon: YouTubeIcon } : null,
    site.social.googleMaps
      ? { href: site.social.googleMaps, label: t('footer.viewOnMaps'), Icon: MapPin }
      : null,
  ];
  const socialLinks = socialLinkCandidates.filter((entry): entry is SocialLink => entry !== null);

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <span className="font-display text-2xl font-medium tracking-[0.08em] text-ink">{site.name}</span>
          <p className="max-w-xs text-sm leading-relaxed text-ink-muted">{localized(site.tagline, locale)}</p>
          <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">{localized(site.reach, locale)}</p>

          <ul className="flex flex-wrap gap-x-1 gap-y-1 text-xs text-ink-faint">
            {site.serviceAreas.map((area, index) => (
              <li key={area}>
                {area}
                {index < site.serviceAreas.length - 1 ? <span aria-hidden="true">, </span> : null}
              </li>
            ))}
          </ul>

          {socialLinks.length > 0 ? (
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-muted transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <nav aria-label={t('footer.navTitle')} className="flex flex-col gap-3">
          <p className={columnTitleClasses}>{t('footer.navTitle')}</p>
          {/* `locales` filtert Seiten heraus, die es in dieser Sprache nicht gibt.
              Ohne das würde der Footer in ku/nl/fr/es auf eine URL zeigen, deren
              Seite dort `notFound()` liefert — und deren Label in jenen
              messages-Dateien ohnehin fehlt. */}
          {NAV_LINKS.filter((item) => !('locales' in item) || item.locales.includes(locale)).map((item) => (
            <Link key={item.href} href={item.href} className={linkClasses}>
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <p className={columnTitleClasses}>{t('footer.legalTitle')}</p>
          <Link href="/impressum" className={linkClasses}>
            {t('footer.imprint')}
          </Link>
          <Link href="/datenschutz" className={linkClasses}>
            {t('footer.privacy')}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <p className={columnTitleClasses}>{t('footer.contactTitle')}</p>
          <a href={site.contact.phoneHref} className={`inline-flex items-center gap-2 ${linkClasses}`}>
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            {site.contact.phone}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 ${linkClasses}`}
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            {t('cta.whatsapp')}
          </a>
          <a href={`mailto:${site.contact.email}`} className={`inline-flex items-center gap-2 break-all ${linkClasses}`}>
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            {site.contact.email}
          </a>
        </div>
      </Container>

      {/* site.previousNames is intentionally not rendered here: it exists only
          for schema.org alternateName/sameAs and redirects, not visible copy
          (the brand is DJ Veys, full stop — see the note in content/site.ts). */}
      <div className="border-t border-line">
        <Container className="py-6 text-xs text-ink-faint">
          <p>
            © {year} {site.name} · {t('footer.rights')}
          </p>
        </Container>
      </div>
    </footer>
  );
}
