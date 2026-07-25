import type { ReactElement } from 'react';

type JsonLdValue = Record<string, unknown>;

/**
 * Renders one or more JSON-LD objects (from `@/lib/schema`) as a
 * `<script type="application/ld+json">` tag. Pure server-renderable markup —
 * no interactivity, so no `'use client'` needed.
 *
 * Lives in its own file (not `schema.ts`) because the bare specifier
 * `@/lib/schema` only resolves to the `.ts` builders file — import this
 * component from `@/lib/json-ld` specifically.
 *
 * `<` is escaped to `<` so a `</script>` sequence inside any interpolated
 * string (an FAQ answer, a name, …) can never prematurely close the tag.
 */
export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }): ReactElement {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  // eslint-disable-next-line react/no-danger -- JSON-LD has no other supported render path.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
