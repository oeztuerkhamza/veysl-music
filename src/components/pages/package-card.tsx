import { Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { PackageItem } from '@/content/packages';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

interface PackageCardProps {
  pkg: PackageItem;
}

/** Self-contained: resolves its own "packages" + "common" copy so the pakete
 *  page just maps `packages` (src/content/packages.ts) to `<PackageCard>`. */
export async function PackageCard({ pkg }: PackageCardProps) {
  const t = await getTranslations('packages');
  const tCommon = await getTranslations('common');
  const features = t.raw(`items.${pkg.id}.features`) as string[];

  const hoursText = pkg.hoursMax == null ? t('hoursUnlimited') : t('hoursValue', { hours: pkg.hoursMax });
  const guestsText = pkg.guestsMax == null ? t('guestsUnlimited') : t('guestsValue', { guests: pkg.guestsMax });
  // priceFrom stays null until real prices exist (see src/content/packages.ts) —
  // never render a fabricated number, always fall back to "Preis auf Anfrage".
  const priceText = pkg.priceFrom == null ? tCommon('onRequest') : `${tCommon('from')} ${pkg.priceFrom} €`;

  return (
    <Reveal>
      <div
        className={cn(
          'flex h-full flex-col gap-6 rounded-lg border p-8',
          pkg.highlighted ? 'border-gold bg-surface-2 shadow-lift' : 'border-line bg-surface'
        )}
      >
        <div>
          {pkg.highlighted ? (
            <p className="mb-3 inline-block rounded-full border border-gold px-3 py-1 text-xs uppercase tracking-[0.15em] text-gold">
              {tCommon('mostBooked')}
            </p>
          ) : null}
          <h3 className="font-display text-3xl text-ink">{t(`items.${pkg.id}.name`)}</h3>
          <p className="mt-1 text-sm uppercase tracking-[0.15em] text-gold">{t(`items.${pkg.id}.tagline`)}</p>
          <p className="mt-4 leading-relaxed text-ink-muted">{t(`items.${pkg.id}.description`)}</p>
        </div>

        <p className="font-display text-2xl text-ink">{priceText}</p>

        <dl className="grid grid-cols-2 gap-4 border-y border-line py-4 text-sm">
          <div>
            <dt className="text-ink-faint">{t('hours')}</dt>
            <dd className="mt-1 text-ink">{hoursText}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">{t('guests')}</dt>
            <dd className="mt-1 text-ink">{guestsText}</dd>
          </div>
        </dl>

        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">{t('includes')}</p>
          <ul className="mt-3 space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-2">
          <Button href="/anfrage" variant={pkg.highlighted ? 'gold' : 'secondary'} size="md" className="w-full">
            {t('cta')}
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
