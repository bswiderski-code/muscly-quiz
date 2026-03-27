import Stripe from 'stripe';
import { PayU } from '@ingameltd/payu';
import { P24 } from '@ingameltd/node-przelewy24';

const STRIPE_API_VERSION = '2026-01-28.clover' as const;

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeSingleton = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  }
  return stripeSingleton;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  return secret;
}

let payuSingleton: PayU | null = null;

export function getPayU(): PayU {
  if (!payuSingleton) {
    const isSandbox = process.env.PAYU_SANDBOX === 'true';
    const clientId = process.env.PAYU_CLIENT_ID;
    const clientSecret = process.env.PAYU_CLIENT_SECRET;
    const posId = process.env.PAYU_POS_ID;
    const secondKey = process.env.PAYU_SECOND_KEY;
    if (!clientId || !clientSecret || !posId || !secondKey) {
      throw new Error(
        'PayU requires PAYU_CLIENT_ID, PAYU_CLIENT_SECRET, PAYU_POS_ID, and PAYU_SECOND_KEY',
      );
    }
    payuSingleton = new PayU(
      Number(clientId),
      clientSecret,
      Number(posId),
      secondKey,
      { sandbox: isSandbox },
    );
  }
  return payuSingleton;
}

let p24Singleton: P24 | null = null;

export function getP24(): P24 {
  if (!p24Singleton) {
    const isSandbox = process.env.P24_SANDBOX === 'true';
    const merchantId = process.env.P24_MERCHANT_ID;
    const posId = process.env.P24_POS_ID;
    const apiKey = process.env.P24_API_KEY;
    const crc = process.env.P24_CRC;
    if (!merchantId || !posId || !apiKey || !crc) {
      throw new Error(
        'Przelewy24 requires P24_MERCHANT_ID, P24_POS_ID, P24_API_KEY, and P24_CRC',
      );
    }
    p24Singleton = new P24(
      Number(merchantId),
      Number(posId),
      apiKey,
      crc,
      { sandbox: isSandbox },
    );
  }
  return p24Singleton;
}

export type S3PdfConfig = {
  region: string;
  bucket: string;
  endpoint: string | undefined;
  credentials: { accessKeyId: string; secretAccessKey: string };
};

/** S3 (or S3-compatible) config for PDF streaming. */
export function getS3PdfConfig(): S3PdfConfig | null {
  const accessKeyId =
    process.env.S3_PDF_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.S3_PDF_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_PDF_BUCKET;
  const region =
    process.env.S3_PDF_REGION ?? process.env.AWS_REGION ?? 'eu-central-1';
  const endpoint =
    process.env.S3_PDF_ENDPOINT?.trim() ||
    process.env.AWS_ENDPOINT_URL?.trim() ||
    undefined;

  if (!accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    region,
    bucket,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  };
}
