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
  // JSON-LD hat keinen anderen unterstützten Renderpfad; das `<` oben ist
  // escaped, damit kein `</script>` im Datenobjekt den Block schließen kann.
  // (`react/no-danger` ist in dieser Config nicht aktiv — ein eslint-disable
  // wäre hier toter Code.)
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
