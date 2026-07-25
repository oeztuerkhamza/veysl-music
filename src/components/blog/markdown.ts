/**
 * Minimal, dependency-free markdown parser for blog post bodies.
 *
 * `src/content/blog/types.ts` documents the exact markdown subset every post
 * body actually uses (see its file header, point 4): `##`/`###` headings,
 * GFM pipe tables, `-`/`1.` lists (list items and paragraphs may soft-wrap
 * across multiple source lines with no blank line between them — hand-
 * wrapped for ~90-column source readability, not a hard line break),
 * `**bold**`/`*italic*` inline spans, and (only inside the two excluded
 * `status: 'template'` recap posts) `>` blockquotes. No links, images, code
 * spans/blocks or nested lists appear anywhere in the corpus — internal
 * links are structured data, never inline markdown links (same file header).
 *
 * This file only supports exactly that subset, deliberately: a general-
 * purpose markdown/remark pipeline is unnecessary weight for content this
 * regular (see `.claude/CONTRACT.md` §2 — no heavy deps without asking).
 * Every node becomes a real React element in `post-body.tsx` (never
 * `dangerouslySetInnerHTML`), so there is no HTML-injection surface
 * regardless of what a post body contains.
 */

export type MarkdownBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'blockquote'; text: string };

const H3 = /^###\s+/;
const H2 = /^##\s+/;
const UL_ITEM = /^-\s+/;
const OL_ITEM = /^\d+\.\s+/;
const TABLE_ROW = /^\|/;
const BLOCKQUOTE = /^>\s?/;

function isBlockStart(line: string): boolean {
  return H3.test(line) || H2.test(line) || UL_ITEM.test(line) || OL_ITEM.test(line) || TABLE_ROW.test(line) || BLOCKQUOTE.test(line);
}

/**
 * Joins hand-wrapped source lines back into logical lines (one per heading,
 * paragraph, list item, table row or blockquote line) — a paragraph or list
 * item wrapped at ~90 columns in the source renders as one continuous run of
 * text instead of breaking mid-sentence. Blank lines are kept as `''`
 * separators between logical lines.
 */
function toLogicalLines(source: string): string[] {
  const rawLines = source.replace(/\r\n/g, '\n').split('\n');
  const logical: string[] = [];

  for (const raw of rawLines) {
    const line = raw.trim();
    if (line === '') {
      logical.push('');
      continue;
    }
    const prev = logical[logical.length - 1];
    if (!isBlockStart(line) && prev !== undefined && prev !== '') {
      logical[logical.length - 1] = `${prev} ${line}`;
    } else {
      logical.push(line);
    }
  }

  return logical;
}

function stripListMarker(line: string): string {
  return line.replace(UL_ITEM, '').replace(OL_ITEM, '');
}

function parseTableRow(line: string): string[] {
  const withoutEdges = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return withoutEdges.split('|').map((cell) => cell.trim());
}

function isTableSeparatorRow(line: string): boolean {
  return line.includes('-') && /^\|?[\s:|-]+\|?$/.test(line.trim());
}

/** Groups logical (blank-separated) lines into typed blocks. */
export function parseMarkdownBlocks(source: string): MarkdownBlock[] {
  const logical = toLogicalLines(source);
  const blocks: MarkdownBlock[] = [];

  let i = 0;
  while (i < logical.length) {
    if (logical[i] === '') {
      i++;
      continue;
    }

    const chunkStart = i;
    while (i < logical.length && logical[i] !== '') i++;
    const chunk = logical.slice(chunkStart, i);
    const first = chunk[0];

    if (H3.test(first)) {
      blocks.push({ type: 'h3', text: first.replace(H3, '') });
      continue;
    }
    if (H2.test(first)) {
      blocks.push({ type: 'h2', text: first.replace(H2, '') });
      continue;
    }
    if (TABLE_ROW.test(first)) {
      const header = parseTableRow(chunk[0]);
      const bodyRows = chunk.slice(1).filter((line) => !isTableSeparatorRow(line));
      blocks.push({ type: 'table', header, rows: bodyRows.map(parseTableRow) });
      continue;
    }
    if (BLOCKQUOTE.test(first)) {
      blocks.push({ type: 'blockquote', text: chunk.map((line) => line.replace(BLOCKQUOTE, '')).join(' ') });
      continue;
    }
    if (UL_ITEM.test(first) || OL_ITEM.test(first)) {
      const ordered = OL_ITEM.test(first);
      blocks.push({ type: ordered ? 'ol' : 'ul', items: chunk.map(stripListMarker) });
      continue;
    }

    blocks.push({ type: 'p', text: chunk.join(' ') });
  }

  return blocks;
}

export type InlineToken = { kind: 'text' | 'bold' | 'italic'; value: string };

/** Splits inline `**bold**` / `*italic*` spans out of a text run. No nesting — none of the corpus needs it (see file header). */
export function parseInline(text: string): InlineToken[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter((part) => part.length > 0);

  return parts.map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) return { kind: 'bold', value: part.slice(2, -2) };
    if (part.startsWith('*') && part.endsWith('*')) return { kind: 'italic', value: part.slice(1, -1) };
    return { kind: 'text', value: part };
  });
}

/** Stable, URL-safe anchor id for a heading — Turkish/German diacritics best-effort stripped via NFKD; purely cosmetic (deep-link anchors), never used for content matching. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
