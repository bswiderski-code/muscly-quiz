'use client'

import type { Locale, CheckoutProvider } from '@/i18n/config';

type Props = {
  deviceType: 'apple' | 'android' | 'other';
  locale: Locale;
  checkoutProvider: CheckoutProvider;
  offers: React.ReactNode[];
  separatorText: string;
  paymentNoteHtml?: string;
};

export function PaymentSection({ deviceType, locale, checkoutProvider, offers, separatorText, paymentNoteHtml }: Props) {
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
          <div style={{ fontFamily: "inherit", fontSize: 15, marginBottom: 8, textAlign: 'center' }}>
            <span dangerouslySetInnerHTML={{ __html: paymentNoteHtml }} />
          </div>
        )}
      </div>
    </div>
  );
}
