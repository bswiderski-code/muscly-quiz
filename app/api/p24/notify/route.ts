// app/api/p24/notify/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { P24, Currency } from '@ingameltd/node-przelewy24';
import { sendToN8n } from '@/lib/n8n';
import { getCountryForHost, getMarketForHost } from '@/i18n/config';
import { getIncomingHost } from '@/lib/domain/incomingHost';

import { getP24Credentials } from '@/config/credentials';

const isSandbox = process.env.P24_SANDBOX === 'true';
const creds = getP24Credentials(isSandbox);

const p24 = new P24(
  Number(creds.merchantId),
  Number(creds.posId),
  creds.apiKey,
  creds.crc,
  { sandbox: isSandbox }
);

export async function POST(req: NextRequest) {
  // Extract host for market determination
  const host = getIncomingHost(req.headers);
  const market = getMarketForHost(host);
  const country = getCountryForHost(host);

  const body = await req.json();

  const valid = p24.verifyNotification(body);
  if (!valid) {
    await prisma.trainingPlan.update({
      where: { sid: body.sessionId },
      data: { status: 'failed' },
    });

    await sendToN8n(process.env.N8N_WEBHOOK_URL!, 'checkout.succeeded', {
      checkoutDB: 'training_plans',
      sessionId: body.sessionId,
      event: 'checkout.succeeded',
      status: 'signature_invalid',
    });

    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const verified = await p24.verifyTransaction({
    sessionId: body.sessionId,
    orderId: Number(body.orderId),
    amount: Number(body.amount),
    currency: (market.currency.toUpperCase() as Currency) || Currency.PLN,
  });

  if (!verified) {
    await prisma.trainingPlan.update({
      where: { sid: body.sessionId },
      data: { status: 'failed' },
    });

    await sendToN8n(process.env.N8N_WEBHOOK_URL!, 'checkout.succeeded', {
      checkoutDB: 'training_plans',
      sessionId: body.sessionId,
      event: 'checkout.succeeded',
      status: 'transaction_verification_failed',
    });

    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await prisma.trainingPlan.update({
    where: { sid: body.sessionId },
    data: { status: 'paid' },
  });

  try {
    const checkout = await prisma.trainingPlan.findUnique({
      where: { sid: body.sessionId },
      select: {
        id: true,
        name: true,
        email: true,
        amount: true,
        currency: true,
        sid: true,
        paymentId: true,
        description: true,
      },
    });

    if (checkout) {
      await prisma.orders.create({
        data: {
          item: checkout.description ?? 'workout',
          name: checkout.name ?? '',
          email: checkout.email ?? '',
          checkoutId: checkout.id,
          checkoutDB: 'training_plans',
          sessionId: checkout.sid,
          amount: Math.round(checkout.amount * 100),
          currency: checkout.currency || market.currency || 'PLN',
          country: country,
          payment_provider: 'Przelewy24',
          paymentId: checkout.paymentId ?? String(body.orderId ?? ''),
        },
      });
    }
  } catch (e) {
    console.error('Failed to create Orders row for session', body.sessionId, e);
  }

  await sendToN8n(process.env.N8N_WEBHOOK_URL!, 'checkout.succeeded', {
    checkoutDB: 'training_plans',
    sessionId: body.sessionId,
    event: 'checkout.succeeded',
    status: 'paid',
    country: country,
  });

  return NextResponse.json({ ok: true });
}
