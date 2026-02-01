'use client'

import Image from "next/image";
import type { Locale, CheckoutProvider } from '@/i18n/config';

export type PaymentLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  showOn?: 'apple' | 'android' | 'all';
};

type Props = {
  deviceType: 'apple' | 'android' | 'other';
  locale: Locale;
  checkoutProvider: CheckoutProvider;
  offers: React.ReactNode[];
  separatorText: string;
  paymentNoteHtml?: string;
};

const paymentLogosByLocale: Record<Locale, PaymentLogo[]> = {
  pl: [
    { src: '/payments/payu.svg', alt: 'PayU', width: 68, height: 24 },
    { src: '/payments/blik.svg', alt: 'BLIK', width: 46, height: 24 },
    { src: '/payments/apple_pay.svg', alt: 'Apple Pay', width: 59, height: 24, showOn: 'apple' },
    { src: '/payments/google_pay.svg', alt: 'Google Pay', width: 51, height: 24, showOn: 'android' },
  ],
  en: [
    { src: '/payments/visa.svg', alt: 'Visa', width: 46, height: 24 },
    { src: '/payments/mastercard.svg', alt: 'Mastercard', width: 46, height: 24 },
    { src: '/payments/apple_pay.svg', alt: 'Apple Pay', width: 44, height: 19, showOn: 'apple' },
    { src: '/payments/google_pay.svg', alt: 'Google Pay', width: 51, height: 24, showOn: 'android' },
    { src: '/payments/paypal.svg', alt: 'PayPal', width: 60, height: 30 },
  ],
  ro: [
    { src: '/payments/visa.svg', alt: 'Visa', width: 46, height: 24 },
    { src: '/payments/mastercard.svg', alt: 'Mastercard', width: 46, height: 24 },
    { src: '/payments/apple_pay.svg', alt: 'Apple Pay', width: 44, height: 19, showOn: 'apple' },
    { src: '/payments/google_pay.svg', alt: 'Google Pay', width: 51, height: 24, showOn: 'android' },
  ],
  de: [
    { src: '/payments/visa.svg', alt: 'Visa', width: 46, height: 24 },
    { src: '/payments/mastercard.svg', alt: 'Mastercard', width: 46, height: 24 },
    { src: '/payments/apple_pay.svg', alt: 'Apple Pay', width: 44, height: 19, showOn: 'apple' },
    { src: '/payments/google_pay.svg', alt: 'Google Pay', width: 51, height: 24, showOn: 'android' },
    { src: '/payments/paypal.svg', alt: 'PayPal', width: 60, height: 30 },
  ],
  fr: [
    { src: '/payments/visa.svg', alt: 'Visa', width: 46, height: 24 },
    { src: '/payments/mastercard.svg', alt: 'Mastercard', width: 46, height: 24 },
    { src: '/payments/apple_pay.svg', alt: 'Apple Pay', width: 44, height: 19, showOn: 'apple' },
    { src: '/payments/google_pay.svg', alt: 'Google Pay', width: 51, height: 24, showOn: 'android' },
    { src: '/payments/paypal.svg', alt: 'PayPal', width: 60, height: 30 },
  ],
};

export function PaymentSection({ deviceType, locale, checkoutProvider, offers, separatorText, paymentNoteHtml }: Props) {
  const resolvedLocale: Locale = paymentLogosByLocale[locale] ? locale : 'en';
  const baseLogos = paymentLogosByLocale[resolvedLocale];
  const providerAdjusted = checkoutProvider === 'stripe' ? baseLogos : paymentLogosByLocale.pl;

  const visibleLogos = providerAdjusted.filter((logo) => {
    const showOn = logo.showOn ?? 'all';
    if (showOn === 'all') return true;
    return deviceType === showOn;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
      {offers.map((node, idx) => (
        <div key={idx}>
          {node}
          {idx < offers.length - 1 && (
            <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', margin: '8px 0' }}>
              {separatorText}
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0 0 0' }}>
        {paymentNoteHtml && (
          <div style={{ fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif", fontSize: 15, marginBottom: 8, textAlign: 'center' }}>
            <span dangerouslySetInnerHTML={{ __html: paymentNoteHtml }} />
          </div>
        )}
        {visibleLogos.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '6px 0 0 0' }}>
            {visibleLogos.map((logo) => (
              <Image
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                style={{ width: logo.width, height: logo.height }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
