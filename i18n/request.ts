import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // Ten parametr zazwyczaj pochodzi z Middleware (lub slug'a [locale])
  let locale = await requestLocale;

  // Walidacja: jeśli locale jest nieznane lub puste, użyj domyślnego
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../i18n/translations/${locale}.json`)).default;

  // Dynamically replace {locale} placeholder in all translation strings
  const stringified = JSON.stringify(messages).replace(/\{locale\}/g, locale);
  const finalMessages = JSON.parse(stringified);

  return {
    locale,
    messages: finalMessages
  };
});