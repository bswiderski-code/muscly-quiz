import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
import {defaultLocale, locales} from './config';

export const routing = defineRouting({
    locales,
    defaultLocale,

  // WAŻNE: To ustawienie zawsze pokazuje prefix językowy w URL (np. /pl/, /en/).
  localePrefix: 'always',

  // Tłumaczenie ścieżek (Pathnames)
  // Note: Funnel paths are now dynamic via /[funnel] pattern.
  // Funnel slugs are defined in lib/funnels/funnelDefinitions.ts
  pathnames: {
    '/': '/',
    '/privacy': { pl: '/privacy', en: '/privacy', fr: '/privacy', de: '/privacy', ro: '/privacy' },
    '/terms': { pl: '/terms', en: '/terms', fr: '/terms', de: '/terms', ro: '/terms' },
    '/[funnel]': { pl: '/[funnel]', en: '/[funnel]', fr: '/[funnel]', de: '/[funnel]', ro: '/[funnel]' },
    '/[funnel]/[step]': { pl: '/[funnel]/[step]', en: '/[funnel]/[step]', fr: '/[funnel]/[step]', de: '/[funnel]/[step]', ro: '/[funnel]/[step]' },
    '/wynik/[funnel]/[sessionId]': {
      pl: '/wynik/[funnel]/[sessionId]',
      en: '/result/[funnel]/[sessionId]',
      fr: '/result/[funnel]/[sessionId]',
      de: '/result/[funnel]/[sessionId]',
      ro: '/rezultat/[funnel]/[sessionId]'
    },
    '/wynik/zamowienie/[sessionId]': {
      pl: '/wynik/zamowienie/[sessionId]',
      en: '/result/order/[sessionId]',
      fr: '/result/order/[sessionId]',
      de: '/result/order/[sessionId]',
      ro: '/rezultat/comanda/[sessionId]'
    },
  }
});

// Eksportujemy nawigację, której będziesz używać w komponentach (Link, redirect, itp.)
// Zastąp standardowe importy z 'next/link' i 'next/navigation' tymi poniżej.
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);