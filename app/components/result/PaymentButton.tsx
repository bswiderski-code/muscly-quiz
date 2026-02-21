'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { CheckoutProvider } from '@/i18n/config';

const ENDPOINT: Record<CheckoutProvider, string> = {
  stripe: '/api/stripe/create',
  payu:   '/api/payu/create',
  p24:    '/api/p24/create',
};

export type PaymentButtonProps = {
  provider: CheckoutProvider;
  buttonSvg: string;
  amount: number;
  currency: string;
  description: string;
  onPay: (payHandler: (formData: Record<string, unknown>) => void) => void;
  onBeforePay?: () => void;
  productName?: string;
  imageAlt?: string;
  loadingLabel?: string;
};

export function PaymentButton({
  provider,
  buttonSvg,
  amount,
  currency,
  description,
  onPay,
  onBeforePay,
  productName,
  imageAlt,
  loadingLabel,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      const body =
        provider === 'stripe'
          ? { ...formData, amount, currency, description, productName }
          : { ...formData, amountPln: amount, description, productName };

      const res = await fetch(ENDPOINT[provider], {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment error');
      if (!data.url) throw new Error('No redirect URL returned');
      window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '0', position: 'relative' }}>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          onBeforePay?.();
          onPay(handlePay);
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          position: 'relative',
        }}
      >
        <Image
          src={buttonSvg}
          alt={imageAlt ?? description}
          width={400}
          height={120}
          style={{ width: '100%', height: 'auto', display: 'block', opacity: loading ? 0.7 : 1 }}
        />
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 18,
              color: '#222',
              background: 'rgba(255,255,255,0.7)',
              zIndex: 3,
            }}
          >
            {loadingLabel ?? 'Przekierowuję…'}
          </div>
        )}
      </button>
    </div>
  );
}
