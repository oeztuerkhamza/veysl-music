import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type City } from '@/content/cities';
import { isTurkishDjLocale } from '@/content/turkish-dj';
import { site } from '@/content/site';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Der lokale Aufhänger einer Stadtseite — `city.angle`, also das Argument,
 * warum Paare *in dieser Stadt* buchen.
 *
 * Hieß bis August 2026 `CityBicultural` und rief ganz oben
 * `if (!city.turkishCommunity) return null` auf. Solange alle neun Städte
 * `turkishCommunity: true` trugen, fiel nicht auf, was das bedeutet: Der
 * `angle` hatte auf der ganzen Seite **keinen zweiten Renderpfad**. Beim
 * Ausbau des Clusters auf Städte, für die eine türkische Community nicht
 * belegt ist (Tübingen, Heidelberg, Freiburg, Bodensee …), wurde daraus eine
 * Zwickmühle mit zwei schlechten Ausgängen: Entweder `false` — dann
 * verschwindet der einzige stadtspezifische Absatz der Seite kommentarlos und
 * übrig bleibt genau die Textbaustein-Seite, vor der `cities.ts` im Dateikopf
 * warnt. Oder `true` — dann behauptet die Seite unter der Überschrift
 * „Türkischer DJ in {city}" eine Demografie, die niemand geprüft hat.
 *
 * Beides ist jetzt entkoppelt: Der `angle` rendert immer. Nur die
 * *bikulturelle Rahmung* — Überschrift und Eyebrow — hängt noch an
 * `turkishCommunity`.
 *
 * Die Sprach-Chips bleiben bewusst in beiden Fällen stehen: Moderation auf
 * Deutsch, Türkisch und Englisch ist eine Eigenschaft des Anbieters
 * (`site.stats.hostingLanguages`), keine Aussage über die Stadt. Sie zu
 * verstecken, wo die Community unbelegt ist, würde eine belegte Fähigkeit
 * verschweigen, um eine unbelegte Behauptung zu vermeiden.
 *
 * Rendert weiterhin nichts, wenn für die aktive Sprache keine `angle`-Prosa
 * vorliegt — niemals ein deutscher Absatz auf einer türkischen Seite.
 */
export function CityAngle({ city, locale }: { city: City; locale: Locale }) {
  const t = useTranslations('city');
  const tLang = useTranslations('booking.hostingLanguages');

  const angle = resolveLocalized(city.angle, locale);
  if (!angle) return null;

  const headingKeys = city.turkishCommunity
    ? { eyebrow: 'bicultural.eyebrow', title: 'bicultural.title' }
    : { eyebrow: 'localAngle.eyebrow', title: 'localAngle.title' };

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t(headingKeys.eyebrow)}
            title={t(headingKeys.title, { city: city.name })}
            lead={angle}
          />
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{t('bicultural.languagesTitle')}</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {site.stats.hostingLanguages.map((code) => (
                <li key={code} className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted">
                  {tLang(code)}
                </li>
              ))}
            </ul>
          </div>
          {/* Nur unter der bikulturellen Rahmung, und nur in den Sprachen der
              Türkisch-Nische: Der Verweis führt auf die Landesseite
              „Türkischer DJ Baden-Württemberg" — die eine Aussage, die von
              JEDER Stadt mit belegter Community aus stimmt. Die neutrale
              `localAngle`-Variante bekommt ihn bewusst nicht: Ein
              Türkisch-Link unter einer Überschrift, die gerade keine
              türkische Community behauptet, wäre genau die unbelegte
              Behauptung, die der Dateikopf oben ausschließt. */}
          {city.turkishCommunity && isTurkishDjLocale(locale) ? (
            <p className="mt-6 text-sm text-ink-faint">
              <Link
                href="/tuerkischer-dj-baden-wuerttemberg"
                className="underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold"
              >
                {t('bicultural.stateLink')}
              </Link>
            </p>
          ) : null}
        </Reveal>
      </Container>
    </Section>
  );
}
