'use client';

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');
  const locale = useLocale();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="w-full flex justify-center py-6 px-6 border-b border-gray-100">
        <Link 
          href={`https://musclepals.com/${locale}`}
          className="relative w-32 h-10 transition-opacity hover:opacity-80"
        >
          <Image 
            src="/vectors/logo.svg" 
            alt="Musclepals" 
            fill 
            className="object-contain"
            priority
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md w-full -mt-20">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-8">
            {t('title')}
          </h2>
          
          <div className="flex justify-center">
            <Link 
              href="/"
              className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-2xl font-extrabold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 text-xl"
            >
              {t('startButton')}
            </Link>
          </div>
        </div>

        <p className="mt-16 text-xs text-gray-400 font-bold uppercase tracking-widest">
          404_PAGE_NOT_FOUND
        </p>
      </main>
    </div>
  );
}
