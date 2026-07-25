interface FaqEntry {
  id: string;
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqEntry[];
}

/**
 * Native <details>/<summary> disclosure — fully keyboard operable (Enter/Space
 * toggle natively, Tab moves between summaries) and every answer is present
 * in the server-rendered HTML from the start, never mounted only after a
 * client-side hydration/fetch. That matters here: this content feeds FAQ
 * schema and AI/GEO citation, so it must never be JS-only.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, index) => (
        <details key={item.id} id={`faq-${item.id}`} className="group py-5" open={index === 0}>
          <summary
            className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ink transition-colors marker:content-none hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {item.q}
            <span aria-hidden="true" className="shrink-0 text-gold transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
