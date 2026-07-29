/**
 * ⚠️ Impressumspflicht (§ 5 DDG): a German commercial website must publish a
 * complete, accurate Impressum. This page still shows visible TODO(kunde)
 * placeholders for the street address and the VAT ID — shipping it to
 * production with those still empty is a legal risk (Abmahnung exposure).
 * The full text also still needs a lawyer's review before launch (see the
 * "legal.draftNotice" banner rendered on the page itself).
 */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { getSite } from '@/content/get-site';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { LegalSectionList, MissingValue } from '@/components/pages/legal-section-list';
import { FinalCta } from '@/components/pages/final-cta';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/impressum', noIndex: true });
}

export default async function ImpressumPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.imprint');
  const tLegal = await getTranslations('legal');
  const tCapabilities = await getTranslations('services.capabilitiesStrip');

  // CMS-editable address (Payload global `site-settings`), falling back to
  // src/content/site.ts — see src/content/get-site.ts. legalName/owner and
  // the rest of the Impressum-required fields are not admin-editable on
  // purpose (see BRAND-FACTS.md) and still come straight from site.ts via
  // this same resolved object.
  const site = await getSite();

  const sections = t.raw('sections') as { id: string; title: string; paragraphs: string[] }[];
  const hasStreet = site.address.street.length > 0 && site.address.postalCode.length > 0;

  return (
    <>
      <PageHero title={t('heading')} subtitle={t('intro')} />

      <Section>
        <Container>
          <div className="flex flex-col gap-10">

            <Reveal>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="font-display text-2xl text-ink">{t('providerTitle')}</h2>
                  <dl className="mt-4 flex flex-col gap-3 text-ink-muted">
                    {/* Only rendered when a registered trade name actually
                        exists. Without one, § 5 DDG's required name is the
                        owner's own, shown in the next row — printing a brand
                        here would state a company that is not registered. */}
                    {site.legalName ? (
                      <div>
                        <dt className="text-xs uppercase tracking-[0.15em] text-ink-faint">
                          {t('nameLabel')}
                        </dt>
                        <dd className="text-ink">{site.legalName}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-xs uppercase tracking-[0.15em] text-ink-faint">{t('ownerLabel')}</dt>
                      <dd className="text-ink">{site.owner}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.15em] text-ink-faint">{t('addressLabel')}</dt>
                      <dd className="text-ink">
                        {hasStreet ? (
                          <>
                            {site.address.street}
                            <br />
                            {site.address.postalCode} {site.address.city}
                          </>
                        ) : (
                          <>
                            <MissingValue text={tLegal('missingValue')} />
                            <br />
                            {site.address.city}
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h2 className="font-display text-2xl text-ink">{t('contactTitle')}</h2>
                  <dl className="mt-4 flex flex-col gap-3 text-ink-muted">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.15em] text-ink-faint">{t('phoneLabel')}</dt>
                      <dd>
                        <a href={site.contact.phoneHref} className="text-ink transition-colors hover:text-gold">
                          {site.contact.phone}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.15em] text-ink-faint">{t('emailLabel')}</dt>
                      <dd>
                        <a href={`mailto:${site.contact.email}`} className="text-ink transition-colors hover:text-gold">
                          {site.contact.email}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.15em] text-ink-faint">{t('websiteLabel')}</dt>
                      <dd className="text-ink">{site.domain}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div>
                <h2 className="font-display text-2xl text-ink">{t('activityTitle')}</h2>
                <ul className="mt-4 flex flex-col gap-2 text-ink-muted">
                  {site.capabilities.map((id) => (
                    <li key={id}>{tCapabilities(`items.${id}.label`)}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/*
              Drei Zustände, gepflegt im Adminpanel (site-settings →
              „Rechtliche Angaben"): USt-IdNr. vorhanden, oder
              Kleinunternehmerregelung nach § 19 UStG, oder — solange beides
              fehlt — ein sichtbarer Platzhalter. Bewusst kein stiller
              Fallback: eine fehlende Pflichtangabe soll auffallen, statt so
              auszusehen, als wäre sie erledigt.
            */}
            <Reveal>
              <div>
                <h2 className="font-display text-2xl text-ink">{t('vatTitle')}</h2>
                {site.vatId ? (
                  <>
                    <p className="mt-3 text-ink-muted">{t('vatText')}</p>
                    <p className="mt-1">{site.vatId}</p>
                  </>
                ) : site.smallBusinessExempt ? (
                  <p className="mt-3 leading-relaxed text-ink-muted">{t('smallBusinessText')}</p>
                ) : (
                  <>
                    <p className="mt-3 text-ink-muted">{t('vatText')}</p>
                    <p className="mt-1">
                      <MissingValue text={tLegal('missingValue')} />
                    </p>
                  </>
                )}
              </div>
            </Reveal>

            {site.professionalInsurance ? (
              <Reveal>
                <div>
                  <h2 className="font-display text-2xl text-ink">{t('insuranceTitle')}</h2>
                  <p className="mt-3 leading-relaxed text-ink-muted">{site.professionalInsurance}</p>
                </div>
              </Reveal>
            ) : null}

            <Reveal>
              <div>
                <h2 className="font-display text-2xl text-ink">{t('responsibleTitle')}</h2>
                <p className="mt-3 text-ink-muted">
                  {site.owner}, {site.address.city}
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div>
                <h2 className="font-display text-2xl text-ink">{t('disputeTitle')}</h2>
                <p className="mt-3 leading-relaxed text-ink-muted">{t('disputeText')}</p>
              </div>
            </Reveal>

            <Reveal>
              <div>
                <h2 className="font-display text-2xl text-ink">{t('consumerDisputeTitle')}</h2>
                <p className="mt-3 leading-relaxed text-ink-muted">{t('consumerDisputeText')}</p>
              </div>
            </Reveal>

            <LegalSectionList sections={sections} />
          </div>
        </Container>
      </Section>

      <FinalCta compact />
    </>
  );
}
