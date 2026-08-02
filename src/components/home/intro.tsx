import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { SiteImage } from '@/components/media';
import { site } from '@/content/site';

/**
 * Entity-clarity paragraph for search crawlers and AI/GEO answer engines: states
 * plainly who Veysel is, what he does, where, and in which languages — as real
 * server-rendered prose directly beneath the hero, not hidden behind any
 * client-only rendering.
 *
 * Set as an editorial standfirst rather than a centred block: indented into the
 * measure, opening on a rule, with the name itself carried in the accent
 * italic. Same words, same crawlable markup — but it reads as the opening of an
 * article instead of as a centred paragraph of filler.
 */
export async function Intro() {
  const t = await getTranslations('home');

  return (
    <Section size="tight">
      <Container>
        <Reveal y={18}>
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-2">
              <span aria-hidden="true" className="block h-px w-16 bg-clay lg:mt-5 lg:w-full" />
            </div>
            <p className="font-display text-2xl leading-[1.45] text-ink sm:text-[1.75rem] lg:col-span-7">
              {t('intro', {
                name: site.owner,
                city: site.city,
                years: site.stats.yearsExperience,
              })}
            </p>
            {/*
              Der Absatz sagt, wer hier arbeitet — das Bild zeigt es. Auf einer
              Hochzeitsseite ist das kein Schmuck: Wer bucht, bucht eine Person,
              und bis hierher war das erste Gesicht der Startseite weit unten.
              Auf schmalen Bildschirmen steht es unter dem Text statt daneben,
              damit die Aussage zuerst kommt und nicht ein Porträt vor dem Satz,
              den es belegen soll.
            */}
            <div className="mt-2 max-w-[16rem] lg:col-span-3 lg:mt-0 lg:max-w-none">
              <SiteImage slot="home.intro.portrait" sizes="(min-width: 1024px) 25vw, 60vw" />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
