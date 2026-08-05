import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { parseMarkdownBlocks, parseInline, slugifyHeading, type MarkdownBlock } from './markdown';

function renderInline(text: string): ReactNode {
  return parseInline(text).map((token, index) => {
    if (token.kind === 'bold') {
      return (
        <strong key={index} className="font-semibold text-ink">
          {token.value}
        </strong>
      );
    }
    if (token.kind === 'italic') {
      return <em key={index}>{token.value}</em>;
    }
    return token.value;
  });
}

function renderBlock(block: MarkdownBlock, index: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2
          key={index}
          id={slugifyHeading(block.text)}
          className="mt-14 scroll-mt-28 font-display text-2xl font-medium text-ink first:mt-0 sm:text-3xl"
        >
          {renderInline(block.text)}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={index} id={slugifyHeading(block.text)} className="mt-10 scroll-mt-28 font-display text-xl font-medium text-ink sm:text-2xl">
          {renderInline(block.text)}
        </h3>
      );
    case 'p':
      return (
        <p key={index} className="mt-6 text-lg leading-relaxed text-ink-muted first:mt-0">
          {renderInline(block.text)}
        </p>
      );
    case 'ul':
      return (
        <ul key={index} className="mt-6 list-disc space-y-2 ps-6 text-lg leading-relaxed text-ink-muted marker:text-gold">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={index} className="mt-6 list-decimal space-y-2 ps-6 text-lg leading-relaxed text-ink-muted marker:font-semibold marker:text-gold">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div key={index} className="mt-8 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[36rem] border-collapse text-start text-sm sm:text-base">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                {block.header.map((cell, i) => (
                  <th key={i} scope="col" className="px-4 py-3 font-display text-base font-medium text-ink">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-line last:border-b-0 even:bg-surface/40">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 align-top text-ink-muted">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'blockquote':
      return (
        <blockquote key={index} className="mt-6 border-s-2 border-gold py-1 ps-4 text-lg italic leading-relaxed text-ink-muted">
          {renderInline(block.text)}
        </blockquote>
      );
    default:
      return null;
  }
}

export interface PostBodyProps {
  /** Plain markdown string — one post's `translations[locale].body` (see `src/content/blog/types.ts`). */
  body: string;
  className?: string;
}

/**
 * Renders a blog post body as real, styled React elements — never
 * `dangerouslySetInnerHTML` (see `.claude/CONTRACT.md` and the brief: "never
 * dangerouslySetInnerHTML un-sanitised content"). Parsing lives in
 * `./markdown.ts`; this file only maps the resulting block AST to JSX with
 * the site's editorial typography (Cormorant headings, ~65–75ch measure via
 * the caller's `<Container size="narrow">`, gold list markers/rules).
 */
export function PostBody({ body, className }: PostBodyProps) {
  const blocks = parseMarkdownBlocks(body);

  return <div className={cn('max-w-none', className)}>{blocks.map((block, index) => renderBlock(block, index))}</div>;
}
