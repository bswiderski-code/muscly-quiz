'use client';

import { useTranslations, useLocale } from 'next-intl';
import { MAIN_SITE_URL } from '@/config/site';

export default function TechnicalIssuesPage() {
  const t = useTranslations('TechnicalIssues');
  const locale = useLocale();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-8 sm:px-8 sm:py-12">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        {/* Icon - simple wrench/tool representation */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600"
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8"
          >
            <path
              fillRule="evenodd"
              d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309a5.25 5.25 0 016.756-5.472z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('title')}
        </h1>

        <p className="text-base leading-relaxed text-[var(--c-muted)] sm:text-lg">
          {t('description')}
        </p>

        <a
          href={`${MAIN_SITE_URL}/${locale}`}
          className="mt-2 inline-flex min-h-[48px] min-w-[180px] items-center justify-center rounded-2xl bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90 active:opacity-80"
        >
          {t('backLabel')}
        </a>
      </div>
    </main>
  );
}
