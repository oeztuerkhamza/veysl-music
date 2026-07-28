import type { MetadataRoute } from 'next';
import { siteBaseUrl } from '@/lib/seo';

/**
 * Deliberate business decision, not an oversight: this project's stated goal
 * explicitly includes visibility in AI answer engines (ChatGPT, Perplexity,
 * Google AI Overviews) alongside classic search — see .claude/CONTRACT.md and
 * the GEO/llms.txt brief. The major AI/LLM crawlers are therefore allowed here
 * rather than left to each bot's own default behaviour.
 *
 * This is fully reversible: if the client later decides they don't want their
 * content used for AI training or cited in AI answers, change these rules to
 * `disallow: '/'` for the relevant user-agents (or remove them, which leaves
 * each crawler's own default policy in effect).
 */
const AI_CRAWLERS = [
  'GPTBot', // OpenAI training crawler
  'OAI-SearchBot', // OpenAI/ChatGPT search
  'ChatGPT-User', // ChatGPT browsing on a user's behalf
  'PerplexityBot', // Perplexity search/answers
  'ClaudeBot', // Anthropic training crawler
  'Claude-User', // Claude browsing on a user's behalf
  'Google-Extended', // Governs Gemini/AI Overviews use of Google-crawled content
  'CCBot', // Common Crawl (feeds many downstream LLMs)
  'Applebot-Extended', // Governs Apple Intelligence use of Applebot-crawled content
];

/** Die einzige Domain, die indexiert werden darf. */
const CANONICAL_HOST = 'dj-veys.de';

export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();

  /**
   * Jede andere Herkunft als die Produktionsdomain wird komplett gesperrt.
   *
   * Grund: eine Gratis-Vorschau (Vercel, Netlify, …) ist eine vollständige
   * Kopie dieser Website. Wird sie indexiert, konkurriert sie später mit
   * dj-veys.de um dieselben Keywords — und das ausgerechnet in einem Projekt,
   * dessen größtes SEO-Risiko ohnehin ein Domainumzug ist (CHECKLIST.md A.4).
   * Eine versehentlich indexierte Vorschau wieder aus dem Index zu bekommen
   * kostet Wochen; sie gar nicht erst hineinzulassen kostet diese Zeilen.
   *
   * Greift automatisch: die Vorschau setzt NEXT_PUBLIC_SITE_URL auf ihre
   * eigene URL (oder gar nicht), niemals auf dj-veys.de.
   */
  // Bewusst direkt aus der Umgebung statt über siteBaseUrl(): dessen Fallback
  // ist site.url, also dj-veys.de. Eine Vorschau, bei der NEXT_PUBLIC_SITE_URL
  // schlicht vergessen wurde, gälte damit als kanonisch und wäre indexierbar —
  // und genau das Vergessen ist der wahrscheinlichste Fehler. Fehlt die
  // Variable, wird deshalb gesperrt: die sichere Richtung.
  let isCanonical = false;
  try {
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    isCanonical = !!configured && new URL(configured).hostname.replace(/^www\./, '') === CANONICAL_HOST;
  } catch {
    isCanonical = false;
  }

  if (!isCanonical) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: '/api/' })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
