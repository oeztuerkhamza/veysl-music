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

export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: '/api/' })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
