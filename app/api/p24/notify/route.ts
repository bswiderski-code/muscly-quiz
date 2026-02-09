// app/api/p24/notify/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { P24, Currency } from '@ingameltd/node-przelewy24';
import { sendToN8n } from '@/lib/n8n';
import { getCountryForHost, getMarketForHost } from '@/i18n/config';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import { normalizeCountryCode } from '@/lib/i18n/countryUtils';
import { v4 as uuidv4 } from 'uuid';

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
    await (prisma as any).userData.updateMany({
      where: { sid: body.sessionId },
      data: { status: 'failed' },
    });

    await sendToN8n(process.env.N8N_WEBHOOK_URL!, {
      sessionid: body.sessionId,
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
    await (prisma as any).userData.updateMany({
      where: { sid: body.sessionId },
      data: { status: 'failed' },
    });

    await sendToN8n(process.env.N8N_WEBHOOK_URL!, {
      sessionid: body.sessionId,
    });

    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await (prisma as any).userData.updateMany({
    where: { sid: body.sessionId },
    data: { status: 'paid' },
  }).catch(() => undefined);

  let userData: any = null;
  try {
    userData = await (prisma as any).userData.findFirst({
      where: { sid: body.sessionId },
    });

    if (userData) {
      // Check if order exists
      const existing = await (prisma as any).order.findFirst({ where: { userId: userData.id, paymentProvider: 'P24' } });
      if (!existing) {
        await (prisma as any).order.create({
          data: {
            item: userData.item,
            userId: userData.id,
            amount: Number(body.amount) / 100, // P24 amount is integer, e.g. 12300 for 123 PLN
            currency: market.currency || 'PLN',
            country: normalizeCountryCode(userData.country || country),
            paymentProvider: 'P24',
            pdfToken: uuidv4(),
          },
        });
      }
    }
  } catch (e) {
    console.error('Failed to create Order row for session', body.sessionId, e);
  }

  await sendToN8n(process.env.N8N_WEBHOOK_URL!, {
    sessionid: body.sessionId,
  });

  return NextResponse.json({ ok: true });
}

