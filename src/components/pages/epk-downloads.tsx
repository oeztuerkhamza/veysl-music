import { Download, FileText, Images, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { EpkDownload, EpkDownloadId } from '@/content/epk';

const LABEL_KEY: Record<EpkDownloadId, string> = {
  press: 'downloadPress',
  rider: 'downloadRider',
  epk: 'downloadEpk',
};

const ICONS: Record<EpkDownloadId, LucideIcon> = {
  press: Images,
  rider: FileText,
  epk: Download,
};

interface EpkDownloadsProps {
  downloads: EpkDownload[];
}

/** Renders each download as a real link once a file exists, otherwise a
 *  clearly-labelled disabled state — never a link to a file that 404s. */
export async function EpkDownloads({ downloads }: EpkDownloadsProps) {
  const t = await getTranslations('epk');

  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {downloads.map((item) => {
        const Icon = ICONS[item.id];
        const label = t(LABEL_KEY[item.id]);
        const disabled = !item.href;

        return (
          <li key={item.id}>
            {disabled ? (
              <span
                aria-disabled="true"
                className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line bg-surface-2 p-6 text-center text-ink-faint"
              >
                <Icon aria-hidden="true" className="h-6 w-6" />
                <span className="text-sm text-ink">{label}</span>
                <span className="text-xs uppercase tracking-[0.15em]">{t('downloadPending')}</span>
              </span>
            ) : (
              <a
                href={item.href ?? undefined}
                className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface p-6 text-center text-ink transition-colors hover:border-gold hover:text-gold"
              >
                <Icon aria-hidden="true" className="h-6 w-6" />
                <span className="text-sm">{label}</span>
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
