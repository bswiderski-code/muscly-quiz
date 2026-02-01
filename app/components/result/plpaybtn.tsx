'use client';
import { useState } from 'react';
import Image from 'next/image';
import { getPolishCheckoutProvider } from '@/i18n/config';

type FormData = {
  name?: string;
  email?: string;
  sessionId?: string;
  [k: string]: unknown;
};

type PayP24ButtonProps = {
  onPay: (payHandler: (formData: FormData) => void) => void;
  amount: number;
  description: string;
  buttonSvg: string;
  onBeforePay?: () => void;
  productName?: string;
  imageAlt?: string;
  loadingLabel?: string;
};

function PayP24Button({
  onPay,
  amount,
  description,
  buttonSvg,
  onBeforePay,
  productName,
  imageAlt,
  loadingLabel,
}: PayP24ButtonProps) {
  const [loading, setLoading] = useState(false);

  // Allow switching payment provider via env (NEXT_PUBLIC_PL_PAYMENTS=payu|p24) using shared config helper.
  const provider = getPolishCheckoutProvider();
  const createEndpoint = provider === 'payu' ? '/api/payu/create' : '/api/p24/create';

  const payHandler = async (formData: FormData) => {
    try {
      setLoading(true);
      const res = await fetch(createEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amountPln: amount,
          description: description,
          productName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd tworzenia transakcji');
      window.location.href = data.url;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Błąd tworzenia transakcji';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: "0px 0 0 0", position: "relative" }}>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          onBeforePay?.();
          onPay(payHandler);
        }}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          position: "relative"
        }}
      >
        <Image
          src={buttonSvg}
          alt={imageAlt ?? description}
          width={400}
          height={120}
          style={{ width: "100%", height: "auto", display: "block", opacity: loading ? 0.7 : 1 }}
        />
        {loading && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              textAlign: "center",
              fontWeight: 700,
              fontSize: 18,
              color: "#222",
              background: "rgba(255,255,255,0.7)",
              width: "100%",
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

export type PLPayButtonProps = {
  onPay: (payHandler: (formData: FormData) => void) => void;
  amountPln: number;
  description: string;
  buttonSvg: string;
  onBeforePay?: () => void;
  productName?: string;
  imageAlt?: string;
  loadingLabel?: string;
};

export function PLPayButton({
  onPay,
  amountPln,
  description,
  buttonSvg,
  onBeforePay,
  productName,
  imageAlt,
  loadingLabel,
}: PLPayButtonProps) {
  return (
    <PayP24Button
      onPay={onPay}
      amount={amountPln}
      description={description}
      buttonSvg={buttonSvg}
      onBeforePay={onBeforePay}
      productName={productName}
      imageAlt={imageAlt}
      loadingLabel={loadingLabel}
    />
  );
}
