// lib/navigation.ts
import {createNavigation} from 'next-intl/navigation';
import {Pathnames} from 'next-intl/routing';
import {defaultLocale, locales} from '@/i18n/config';

// TU DEFINIUJEMY TŁUMACZENIA URLI
type LocalizedPathMap = Partial<Record<(typeof locales)[number], string>>;

// Provide base definitions; any missing locales will reuse the English path, then default locale.
const basePathnames: Record<string, LocalizedPathMap> = {
  '/': { pl: '/', en: '/', fr: '/', de: '/' },
  '/plan': { pl: '/plan', en: '/plan', fr: '/plan', de: '/plan' },
  '/[funnel]': { pl: '/[funnel]', en: '/[funnel]', fr: '/[funnel]', de: '/[funnel]' },
  '/[funnel]/[step]': { pl: '/[funnel]/[step]', en: '/[funnel]/[step]', fr: '/[funnel]/[step]', de: '/[funnel]/[step]' },
  '/wynik/[funnel]/[sessionId]': { pl: '/wynik/[funnel]/[sessionId]', en: '/result/[funnel]/[sessionId]', fr: '/result/[funnel]/[sessionId]', de: '/result/[funnel]/[sessionId]' },
  '/wynik/zamowienie/[sessionId]': { pl: '/wynik/zamowienie/[sessionId]', en: '/result/order/[sessionId]', fr: '/result/order/[sessionId]', de: '/result/order/[sessionId]' },
};

const withAllLocales = (paths: LocalizedPathMap): Record<(typeof locales)[number], string> => {
  return locales.reduce((acc, locale) => {
    acc[locale] = paths[locale] ?? paths.en ?? paths[defaultLocale] ?? Object.values(paths)[0] ?? '/';
    return acc;
  }, {} as Record<(typeof locales)[number], string>);
};

export const pathnames = Object.fromEntries(
  Object.entries(basePathnames).map(([key, value]) => [key, withAllLocales(value)])
) satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation({locales, pathnames});