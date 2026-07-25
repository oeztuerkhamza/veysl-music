import { AlertTriangle } from 'lucide-react';

interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

interface LegalSectionListProps {
  sections: LegalSection[];
}

/** Shared renderer for the impressum/datenschutz section arrays (t.raw('...sections')). */
export function LegalSectionList({ sections }: LegalSectionListProps) {
  return (
    <div className="flex flex-col gap-10">
      {sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
          <h2 id={`${section.id}-heading`} className="font-display text-2xl text-ink">
            {section.title}
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Prominent "must be reviewed by a lawyer" banner for both legal pages. */
export function DraftNotice({ text }: { text: string }) {
  return (
    <div role="note" className="flex items-start gap-3 rounded-lg border border-gold/40 bg-surface-2 p-4 text-sm text-ink-muted">
      <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
      <p>{text}</p>
    </div>
  );
}

/** Inline placeholder for still-missing Impressum facts (street address, VAT id, …). */
export function MissingValue({ text }: { text: string }) {
  return (
    <span className="rounded border border-dashed border-gold/50 px-1.5 py-0.5 text-xs uppercase tracking-wide text-gold">
      {text}
    </span>
  );
}
