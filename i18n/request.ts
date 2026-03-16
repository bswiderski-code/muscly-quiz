import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { getSupportEmail } from '@/lib/i18n/emailUtils';
import { MAIN_SITE_URL } from '@/config/site';

export default getRequestConfig(async ({ requestLocale }) => {
  // Ten parametr zazwyczaj pochodzi z Middleware (lub slug'a [locale])
  let locale = await requestLocale;

  // Walidacja: jeśli locale jest nieznane lub puste, użyj domyślnego
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../i18n/translations/${locale}.json`)).default;
  const email = getSupportEmail(locale);
  const privacyUrl = `${MAIN_SITE_URL}/${locale}/privacy`;
  const termsUrl = `${MAIN_SITE_URL}/${locale}/terms`;

  // Dynamically replace {locale}, {email}, {privacyUrl}, and {termsUrl} placeholders in all translation strings
  const stringified = JSON.stringify(messages)
    .replace(/\{locale\}/g, locale)
    .replace(/\{email\}/g, email)
    .replace(/\{privacyUrl\}/g, privacyUrl)
    .replace(/\{termsUrl\}/g, termsUrl);

  const finalMessages = JSON.parse(stringified);

  // Inject email into specific paths for backward compatibility if they were removed from JSON
  if (finalMessages.ResultPage?.contactBox) {
    finalMessages.ResultPage.contactBox.emailAddress = email;
  }
  if (finalMessages.OrderPage) {
    finalMessages.OrderPage.successEmail = email;
  }
  if (finalMessages.MissingSteps?.persistentError) {
    finalMessages.MissingSteps.persistentError.contactEmail = email;
  }

  // Inject legal URLs for backward compatibility
  if (finalMessages.PlanPage) {
    if (!finalMessages.PlanPage.assets) finalMessages.PlanPage.assets = {};
    finalMessages.PlanPage.assets.privacyUrl = privacyUrl;
    finalMessages.PlanPage.assets.termsUrl = termsUrl;
  }

  return {
    locale,
    messages: finalMessages
  };
});