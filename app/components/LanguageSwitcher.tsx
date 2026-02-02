'use client';

import { useLocale } from 'next-intl';
import { locales, type Locale } from '@/i18n/config';
import { Link, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';

const flags: Record<Locale, string> = {
  pl: '🇵🇱',
  en: '🇺🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ro: '🇷🇴',
  cz: '🇨🇿',
  bg: '🇧🇬',
  hu: '🇭🇺',
};

export default function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();

  return (
    <nav 
      aria-label="Language selection"
      style={{ 
        display: 'flex', 
        gap: '16px', 
        justifyContent: 'center', 
        marginTop: '24px',
        fontSize: '14px',
      }}
    >
      {locales.map((locale) => (
        <Link
          key={locale}
          href={{ pathname: pathname as any, params: params as any }}
          locale={locale}
          style={{
            textDecoration: 'none',
            color: currentLocale === locale ? '#000' : '#777',
            fontWeight: currentLocale === locale ? '700' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            opacity: currentLocale === locale ? 1 : 0.6,
          }}
        >
          <span style={{ fontSize: '18px' }}>{flags[locale]}</span>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{locale}</span>
        </Link>
      ))}
    </nav>
  );
}
