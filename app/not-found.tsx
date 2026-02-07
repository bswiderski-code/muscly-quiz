'use client';

import { Nunito } from "next/font/google";
import Image from "next/image";
import "./[locale]/globals.css";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const nunito = Nunito({
  subsets: ["latin"],
  display: 'swap',
});

const translations = {
  en: {
    pageNotFound: "Page not found",
    description: "Oops! It seems you've wandered off the training track.",
    backToHome: "Back to Home"
  },
  pl: {
    pageNotFound: "Strona nie znaleziona",
    description: "Ups! Wygląda na to, że zboczyłeś ze ścieżki treningowej.",
    backToHome: "Wróć na stronę główną"
  },
  de: {
    pageNotFound: "Seite nicht gefunden",
    description: "Hoppla! Es scheint, du bist vom Trainingspfad abgekommen.",
    backToHome: "Zurück zur Startseite"
  },
  fr: {
    pageNotFound: "Page non trouvée",
    description: "Oups ! Il semble que vous vous soyez éloigné de la piste d'entraînement.",
    backToHome: "Retour à l'accueil"
  },
  ro: {
    pageNotFound: "Pagina nu a fost găsită",
    description: "Hopa! Se pare că te-ai rătăcit de pe traseul de antrenament.",
    backToHome: "Înapoi la pagina principală"
  },
  cz: {
    pageNotFound: "Stránka nenalezena",
    description: "Jejda! Zdá se, že jste sešli z tréninkové cesty.",
    backToHome: "Zpět na úvodní stránku"
  },
  bg: {
    pageNotFound: "Страницата не е намерена",
    description: "Опа! Изглежда сте се отклонили от тренировъчния път.",
    backToHome: "Обратно към началната страница"
  },
  hu: {
    pageNotFound: "Az oldal nem található",
    description: "Hoppá! Úgy tűnik, letértél az edzésprogramról.",
    backToHome: "Vissza a főoldalra"
  }
};

type Locale = keyof typeof translations;

// Global 404 for routes without a locale or when middleware is bypassed
export default function NotFound() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    if (pathname) {
      const segments = pathname.split('/');
      // segments[0] is empty string because path starts with /
      const possibleLocale = segments[1] as Locale;
      if (translations[possibleLocale]) {
        setLocale(possibleLocale);
      } else {
        setLocale('en');
      }
    }
  }, [pathname]);

  const t = translations[locale];

  return (
    <html lang={locale} className={nunito.className}>
      <body className="bg-white">
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="relative mb-8">
            <h1 className="text-[12rem] font-black text-gray-50 select-none leading-none">404</h1>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-32 h-32 mb-4 relative">
                 <Image 
                   src="/branding/logo.svg" 
                   alt="MusclePals" 
                   fill 
                   className="object-contain opacity-20"
                 />
              </div>
              <p className="text-2xl font-bold text-gray-900 px-4">
                {t.pageNotFound}
              </p>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-10">
            {t.description}
          </p>

          <a 
            href={`/${locale}`}
            className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {t.backToHome}
          </a>
        </div>
      </body>
    </html>
  );
}
