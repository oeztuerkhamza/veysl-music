import { getTranslations } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/motion/reveal';
import { site } from '@/content/site';

export async function FinalCta() {
  const t = await getTranslations('home.finalCta');
  const tCta = await getTranslations('cta');

  const whatsappHref = `https://wa.me/${site.contact.whatsapp}`;

  return (
    <section id="anfrage" className="bg-gradient-to-br from-gold-deep to-gold py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-bg/70">{t('eyebrow')}</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight text-bg">
              {t('title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-bg/80">{t('subtitle')}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/anfrage" variant="primary" size="lg">
                {tCta('primary')}
              </Button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-bg underline-offset-4 hover:underline"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {tCta('whatsapp')}
              </a>
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.15em] text-bg/70">{t('reassurance')}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
