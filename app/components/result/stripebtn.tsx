'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export type StripePayButtonProps = {
  buttonSvg: string;
  amount: number;
  description: string;
  currency: string;
  onPay: (payHandler: (formData: Record<string, unknown>) => void) => void;
  onBeforePay?: () => void;
  productName?: string;
  imageAlt?: string;
  loadingLabel?: string;
};

export function StripePayButton({
  buttonSvg,
  amount,
  description,
  currency,
  onPay,
  onBeforePay,
  productName,
  imageAlt,
  loadingLabel,
}: StripePayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount,
          currency,
          description,
          productName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Stripe session creation failed:', data);
        alert('Error creating payment session. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating Stripe payment:', error);
      alert('Error initiating payment. Please try again.');
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
          onPay(handleStripePayment);
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
          style={{ width: '100%', height: 'auto', display: 'block', opacity: loading ? 0.7 : 1 }}
        />
        {loading && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              transform: 'translateY(-50%)',
              textAlign: "center",
              fontWeight: 700,
              fontSize: 18,
              color: "#222",
              background: "rgba(255,255,255,0.7)",
              width: "100%",
              zIndex: 3,
            }}
          >
            {loadingLabel ?? 'Redirecting…'}
          </div>
        )}
      </button>
    </div>
  );
}

