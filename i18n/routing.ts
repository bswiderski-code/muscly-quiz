import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { defaultLocale, locales } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,

  // WAŻNE: To ustawienie zawsze pokazuje prefix językowy w URL (np. /regional/pl/, /regional/en/).
  localePrefix: 'always',

  // Tłumaczenie ścieżek (Pathnames)
  // Note: Funnel paths are now dynamic via /[funnel] pattern.
  // Funnel slugs are defined in lib/funnels/funnelDefinitions.ts
  pathnames: {
    '/': '/',
    '/privacy': '/privacy',
    '/terms': '/terms',
    '/[funnel]': '/[funnel]',
    '/[funnel]/[step]': '/[funnel]/[step]',
    '/result/[funnel]/[sessionId]': '/result/[funnel]/[sessionId]',
    '/result/order/[sessionId]': '/result/order/[sessionId]',
  }
});

// Eksportujemy nawigację, której będziesz używać w komponentach (Link, redirect, itp.)
// Zastąp standardowe importy z 'next/link' i 'next/navigation' tymi poniżej.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);