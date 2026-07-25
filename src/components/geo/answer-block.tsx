import type { ReactNode } from 'react';

interface AnswerBlockProps {
  /** Stable anchor id — must be unique across the page (matches `Answer.id` from `@/content/answers`). */
  id: string;
  question: string;
  answer: string;
  /** Concrete facts an engine can lift verbatim — rendered as a short, plain list under the answer. */
  facts?: string[];
  /** Already-resolved internal links (pathname + translated label) — this component never fetches translations itself. */
  links?: ReactNode;
}

/**
 * Renders exactly one Q&A pair with the single structural detail that makes
 * or breaks GEO extraction: the question is a real heading (`<h3>`),
 * immediately followed — in the server-rendered HTML, unconditionally, with
 * no `<details>`/JS toggle and no card border sitting between the two — by
 * its answer paragraph. Never wrap this in an accordion; see
 * docs/GEO-STRATEGY.md for why.
 *
 * Deliberately "dumb": takes already-localized strings and pre-rendered
 * link nodes as props (matching this repo's existing pattern, e.g.
 * `FaqAccordion` / `EmptyState`) rather than resolving its own
 * translations, so it stays reusable regardless of which page renders it.
 */
export function AnswerBlock({ id, question, answer, facts, links }: AnswerBlockProps) {
  return (
    <article id={id} className="scroll-mt-28 border-b border-line py-8 first:pt-0 last:border-b-0">
      <h3 className="font-display text-xl leading-snug text-ink sm:text-2xl">
        <a href={`#${id}`} className="no-underline transition-colors hover:text-gold">
          {question}
        </a>
      </h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">{answer}</p>
      {facts && facts.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5">
          {facts.map((fact) => (
            <li key={fact} className="text-sm text-ink-faint before:mr-2 before:text-gold before:content-['•']">
              {fact}
            </li>
          ))}
        </ul>
      ) : null}
      {links ? <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">{links}</div> : null}
    </article>
  );
}
