import { Cormorant_Garamond, Inter } from 'next/font/google';

/**
 * Display serif for headings. Loaded as the full variable-weight instance
 * (300–700) so fluid clamp() type can lean on any weight without extra
 * static-weight requests.
 */
export const fontDisplay = Cormorant_Garamond({
  weight: 'variable',
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'], // latin-ext covers German umlauts + Turkish ı/ş/ğ
  display: 'swap',
  variable: '--font-display',
});

/** Body / UI sans, variable weight. */
export const fontSans = Inter({
  weight: 'variable',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
});
