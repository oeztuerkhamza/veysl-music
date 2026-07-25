import type { SocialCardLabels } from './social-post-card';

type Translator = (key: string) => string;

/** Builds the `SocialPostCard` label bundle once per section from `getTranslations('social')`. */
export function buildSocialCardLabels(t: Translator): SocialCardLabels {
  return {
    altFallback: {
      instagram: t('grid.altFallback.instagram'),
      youtube: t('grid.altFallback.youtube'),
    },
    typeLabel: {
      image: t('grid.typeLabel.image'),
      video: t('grid.typeLabel.video'),
      carousel: t('grid.typeLabel.carousel'),
      reel: t('grid.typeLabel.reel'),
    },
    openOn: {
      instagram: t('grid.openOn.instagram'),
      youtube: t('grid.openOn.youtube'),
    },
  };
}
