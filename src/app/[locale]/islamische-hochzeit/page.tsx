import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookOpen, Disc3, HandHeart, Mic2, Music3, PartyPopper, type LucideIcon } from 'lucide-react';
import { absoluteUrl, buildMetadata, type StaticPathname } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { breadcrumbSchema, localBusinessSchema, serviceSchema } from '@/lib/schema';
import {
  ISLAMIC_SUPPORTED_LOCALES,
  islamicProgram,
  islamicTimeline,
  isIslamicLocale,
  type IslamicProgramItem,
} from '@/content/islamic';
import { getAnswersByCategory, isAnswerAuthoredIn, resolveAnswerText } from '@/content/answers';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { AnswerBlock } from '@/components/geo/answer-block';
import { ROUTE_LABEL_KEY } from '../fragen/route-labels';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * Only tr/ku/ar — the three locales this page is published in at all, per the
 * client decision reasoned through in `src/content/islamic.ts`. Same gate as
 * the Europe hub: `[locale]/layout.tsx` still enumerates all eight, so without
 * this the build would try to render the page for de/en/nl/fr/es and crash on
 * the `islamic` namespace, which those five message files no longer carry.
 */
export function generateStaticParams() {
  return ISLAMIC_SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isIslamicLocale(locale)) return {};

  return buildMetadata({
    locale,
    pathname: '/islamische-hochzeit',
    availableLocales: [...ISLAMIC_SUPPORTED_LOCALES],
  });
}

const ICONS: Record<IslamicProgramItem['icon'], LucideIcon> = {
  BookOpen,
  HandHeart,
  Mic2,
  Music3,
  Disc3,
  PartyPopper,
};

interface ProgramCopy {
  title: string;
  text: string;
}

/**
 * Die Antworten der Kategorie `islamisch` verlinken auf `/islamische-hochzeit`
 * — richtig auf `/fragen`, sinnlos hier: ein Link auf die Seite, auf der man
 * gerade steht. Wird deshalb nur an dieser Stelle herausgefiltert, statt die
 * Verlinkung im Korpus zu schwächen.
 */
function selfLessLinks(links: readonly StaticPathname[] | undefined): StaticPathname[] {
  return (links ?? []).filter((href) => href !== '/islamische-hochzeit');
}

/**
 * Landingpage für islamisch geprägte Hochzeiten.
 *
 * Die Fragen unten kommen aus `src/content/answers.ts` (Kategorie
 * `islamisch`) statt hier noch einmal getextet zu werden — eine Antwort,
 * eine Quelle. Was diese Seite eigenständig beiträgt, steht darüber: die
 * Programmbausteine und der Beispielablauf mit Uhrzeiten.
 *
 * Kein `FAQPage`-Schema hier, obwohl die Fragen sichtbar sind: `/fragen`
 * zeichnet dieselben Q&As bereits als `FAQPage` aus, und zwei URLs, die für
 * dieselben Fragen dieselbe Auszeichnung beanspruchen, ist genau der Fall,
 * vor dem Googles FAQ-Richtlinie warnt. Der Extraktionsvorteil hängt an der
 * Heading-Antwort-Struktur (`AnswerBlock`), nicht am Markup — der bleibt hier
 * vollständig erhalten. Ausgezeichnet wird stattdessen, was diese Seite
 * wirklich ist: ein `Service`.
 */
export default async function IslamischeHochzeitPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isIslamicLocale(locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('islamic');
  const tRoot = await getTranslations();

  const pageUrl = absoluteUrl('/islamische-hochzeit', locale);

  /**
   * Nur die Fragen, die in dieser Sprache wirklich geschrieben sind. Der
   * Deutsch-Fallback aus `resolveAnswerText()` ist auf `/fragen` richtig,
   * hier aber nicht: Diese Seite ist vollständig übersetzt, und sechs deutsche
   * Q&As unter kurmancî oder arabischen Überschriften wären schlechter als
   * gar kein FAQ-Block. Bleibt nichts übrig, entfällt der Abschnitt komplett;
   * Header und Footer verlinken `/fragen` weiterhin, es geht also kein Weg
   * dorthin verloren.
   *
   * Heute betrifft das `ku` (der Korpus ist in de/tr/en geschrieben) und bis
   * zum Abschluss der Übersetzung auch `ar`. Sobald die Antworten vorliegen,
   * erscheint der Abschnitt von selbst — ohne Änderung an dieser Datei.
   */
  const answers = getAnswersByCategory('islamisch').filter((answer) =>
    isAnswerAuthoredIn(answer, locale),
  );

  const programCopy = t.raw('program.items') as Record<string, ProgramCopy>;
  const timelineCopy = t.raw('timeline.steps') as Record<string, ProgramCopy>;

  // Gleicher Cast, gleicher Grund wie in `page-json-ld.ts`/`buildCityJsonLd()`:
  // die Schema-Interfaces haben literal `'@type'`-Unions und keine
  // Index-Signatur, die Laufzeitform ist aber exakt das, was <JsonLd> erwartet.
  const asRecord = (value: object): Record<string, unknown> => value as Record<string, unknown>;

  const jsonLd = [
    localBusinessSchema(locale),
    breadcrumbSchema([
      { name: tRoot('nav.home'), url: absoluteUrl('/', locale) },
      { name: t('hero.eyebrow'), url: pageUrl },
    ]),
    ...serviceSchema([
      {
        name: t('hero.eyebrow'),
        description: t('meta.description'),
        url: pageUrl,
      },
    ]),
  ].map(asRecord);

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle')} />

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('intro.eyebrow')} title={t('intro.title')} />
            <p className="mt-6 leading-relaxed text-ink-muted">{t('intro.body')}</p>
          </Reveal>
        </Container>
      </Section>

      {/* Der eine Absatz, der diese Seite von jedem Wettbewerber trennt —
          deshalb steht er allein, oberhalb der Bausteinliste, und nicht als
          sechster Punkt unter „Programm". */}
      <Section>
        <Container size="narrow">
          <Reveal>
            <div className="rounded-lg border border-gold/30 bg-surface px-6 py-10 sm:px-10">
              <SectionHeading eyebrow={t('recitation.eyebrow')} title={t('recitation.title')} />
              <p className="mt-6 leading-relaxed text-ink-muted">{t('recitation.body')}</p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t('program.eyebrow')} title={t('program.title')} lead={t('program.lead')} />
          </Reveal>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {islamicProgram.map((item) => {
              const Icon = ICONS[item.icon];
              const copy = programCopy[item.id];
              return (
                <li key={item.id} className="rounded-lg border border-line bg-surface p-6">
                  <Icon className="size-6 text-gold" aria-hidden />
                  <h3 className="mt-4 font-display text-xl text-ink">
                    {copy.title}
                    {item.optional ? (
                      <span className="ms-2 align-middle text-xs uppercase tracking-wider text-ink-faint">
                        {t('program.optionalLabel')}
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{copy.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('timeline.eyebrow')} title={t('timeline.title')} lead={t('timeline.lead')} />
          </Reveal>
          <ol className="mt-12 border-s border-line">
            {islamicTimeline.map((step) => {
              const copy = timelineCopy[step.id];
              return (
                <li key={step.id} className="relative py-6 ps-8 first:pt-0 last:pb-0">
                  <span
                    className="absolute -left-[5px] top-7 size-[9px] rounded-full bg-gold first:top-1"
                    aria-hidden
                  />
                  <p className="font-mono text-sm text-gold">{step.time}</p>
                  <h3 className="mt-1 font-display text-lg text-ink">{copy.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{copy.text}</p>
                </li>
              );
            })}
          </ol>
          <p className="mt-10 text-sm text-ink-faint">{t('timeline.note')}</p>
        </Container>
      </Section>

      {answers.length > 0 ? (
        <Section id="fragen" className="scroll-mt-24">
          <Container size="narrow">
            <Reveal>
              <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} />
            </Reveal>
            <div className="mt-8">
              {answers.map((answer) => (
                <AnswerBlock
                  key={answer.id}
                  id={answer.id}
                  question={resolveAnswerText(answer.q, locale)}
                  answer={resolveAnswerText(answer.a, locale)}
                  facts={answer.facts}
                  links={
                    selfLessLinks(answer.links).length > 0 ? (
                      <>
                        {selfLessLinks(answer.links).map((href) => {
                          const labelKey = ROUTE_LABEL_KEY[href];
                          if (!labelKey) return null;
                          return (
                            <Link
                              key={href}
                              href={href}
                              className="text-gold underline underline-offset-4 hover:text-gold-soft"
                            >
                              {tRoot(labelKey)}
                            </Link>
                          );
                        })}
                      </>
                    ) : undefined
                  }
                />
              ))}
            </div>
            <p className="mt-8 text-sm">
              <Link href="/fragen" className="text-gold underline underline-offset-4 hover:text-gold-soft">
                {t('faq.more')}
              </Link>
            </p>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container>
          <Reveal>
            <div className="rounded-lg border border-line bg-surface px-6 py-12 sm:px-12">
              <SectionHeading
                align="center"
                eyebrow={t('cta.eyebrow')}
                title={t('cta.title')}
                lead={t('cta.subtitle')}
              />
              {/* Zweiter Weg zu Umfang und Preisrahmen. Bis hierher endete die
                  Seite ausschließlich im Anfrageformular — wer überzeugt war,
                  aber vor dem Formular erst wissen wollte, was ein Paket
                  überhaupt umfasst, hatte von dieser Seite aus keinen Pfad
                  dorthin. Beschriftet mit `nav.packages`, das in allen acht
                  Sprachen bereits übersetzt ist: kein neuer Copy-String für
                  einen Link, den der Header ohnehin so benennt. */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button href="/anfrage" variant="gold" size="lg">
                  {t('cta.button')}
                </Button>
                <Link
                  href="/pakete"
                  className="text-sm text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
                >
                  {tRoot('nav.packages')}
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
