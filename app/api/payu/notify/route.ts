import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { PayU } from '@ingameltd/payu';
import { sendToN8n } from '@/lib/n8n';
import { getCountryForHost, getMarketForHost } from '@/i18n/config';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import { v4 as uuidv4 } from 'uuid';

import { getPayUCredentials } from '@/config/credentials';

const isSandbox = process.env.PAYU_SANDBOX === 'true';
const creds = getPayUCredentials(isSandbox);

const payU = new PayU(
	Number(creds.clientId),
	creds.clientSecret,
	Number(creds.merchantPosId),
	creds.secondKey,
	{ sandbox: isSandbox }
);

const getClientIp = (req: NextRequest) => {
	const forwarded = req.headers.get('x-forwarded-for');
	if (forwarded) return forwarded.split(',')[0]?.trim();
	const real = req.headers.get('x-real-ip');
	if (real) return real.trim();
	return '';
};

export async function POST(req: NextRequest) {
	// Extract host for market determination
	const host = getIncomingHost(req.headers);
	const market = getMarketForHost(host);
	const country = getCountryForHost(host);

	const rawBody = await req.text();
	let body: any = {};

	try {
		body = JSON.parse(rawBody);
	} catch (e) {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const order = body?.order;
	const sessionId: string | undefined = order?.extOrderId || order?.orderId;
	const signature = req.headers.get('openpayu-signature') || req.headers.get('OpenPayu-Signature') || '';
	const ip = getClientIp(req);

	if (!sessionId) {
		return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
	}

	// Validate signature
	const valid = signature ? payU.verifyNotification(signature, rawBody) : false;
	if (!valid) {
		return NextResponse.json({ ok: false }, { status: 400 });
	}

	// Validate notifier IP if available
	if (ip && !payU.isIpValid(ip)) {
		return NextResponse.json({ ok: false }, { status: 400 });
	}

	// Accept only successful payments
	if (order?.status !== 'COMPLETED') {
		return NextResponse.json({ ok: true, status: order?.status ?? 'unknown' });
	}

	await (prisma as any).userData.updateMany({
		where: { sid: sessionId },
		data: { status: 'paid' },
	}).catch(() => undefined);

	const userData = await (prisma as any).userData.findFirst({
		where: { sid: sessionId },
	});

	if (!userData) {
		// Payment completed but checkout row missing; return 500 so PayU retries.
		return NextResponse.json({ ok: false, error: 'Checkout not found' }, { status: 500 });
	}

	// Idempotency guard: PayU may retry notifications.
	const existingOrder = await (prisma as any).order.findFirst({
		where: {
			userId: userData.id,
			paymentProvider: 'PayU',
		},
		select: { id: true },
	});

	if (existingOrder) {
		// Already recorded as paid; do not re-send webhook.
		return NextResponse.json({ ok: true, alreadyProcessed: true });
	}

	try {
		await (prisma as any).order.create({
			data: {
				item: userData.item,
				userId: userData.id,
				// Schema: `amount Decimal @db.Decimal(10,2)`.
				// If I pass integer 12300 to Decimal(10,2), it might be interpreted as 12300.00.
				// I should pass 123.00.
				amount: order.totalAmount / 100,
				currency: order.currencyCode || market.currency || 'PLN',
				country: country,
				paymentProvider: 'PayU',
				pdfToken: uuidv4(),
			},
		});
	} catch (e) {
		console.error('Failed to create Order row for session', sessionId, e);
		// Critical: do not send webhook unless Order row was created.
		// Return 500 so PayU retries and we can try again.
		return NextResponse.json({ ok: false, error: 'Failed to create Order row' }, { status: 500 });
	}

	await sendToN8n(process.env.N8N_WEBHOOK_URL!, 'checkout.succeeded', {
		checkoutDB: 'user_data',
		sessionid: sessionId,
		event: 'checkout.succeeded',
		status: 'paid',
		country: country,
		item: userData.item,
		email: userData.email,
		name: userData.name,
		amount: order.totalAmount / 100,
		currency: order.currencyCode,
	});

	return NextResponse.json({ ok: true });
}

