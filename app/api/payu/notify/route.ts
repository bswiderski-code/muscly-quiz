import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { PayU } from '@ingameltd/payu';
import { sendToN8n } from '@/lib/n8n';
import { getCountryForHost, getMarketForHost } from '@/i18n/config';
import { getIncomingHost } from '@/lib/domain/incomingHost';

const payU = new PayU(
	Number(process.env.PAYU_CLIENT_ID!),
	process.env.PAYU_CLIENT_SECRET!,
	Number(process.env.PAYU_MERCHANT_POS_ID!),
	process.env.PAYU_SECOND_KEY!,
	{ sandbox: process.env.PAYU_SANDBOX === 'true' }
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

	await prisma.trainingPlan.update({
		where: { sid: sessionId },
		data: { status: 'paid', paymentId: order?.orderId },
	}).catch(() => undefined);

	const checkout = await prisma.trainingPlan.findUnique({
		where: { sid: sessionId },
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

	if (!checkout) {
		// Payment completed but checkout row missing; return 500 so PayU retries.
		return NextResponse.json({ ok: false, error: 'Checkout not found' }, { status: 500 });
	}

	// Idempotency guard: PayU may retry notifications.
	const existingOrder = await prisma.orders.findFirst({
		where: {
			checkoutDB: 'training_plans',
			sessionId: checkout.sid,
			payment_provider: 'PayU',
		},
		select: { id: true },
	});

	if (existingOrder) {
		// Already recorded as paid; do not re-send webhook.
		return NextResponse.json({ ok: true, alreadyProcessed: true });
	}

	try {
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
				payment_provider: 'PayU',
				paymentId: checkout.paymentId ?? order?.orderId ?? '',
			},
		});
	} catch (e) {
		console.error('Failed to create Orders row for session', sessionId, e);
		// Critical: do not send webhook unless Orders row was created.
		// Return 500 so PayU retries and we can try again.
		return NextResponse.json({ ok: false, error: 'Failed to create Orders row' }, { status: 500 });
	}

	await sendToN8n(process.env.N8N_WEBHOOK_URL!, 'checkout.succeeded', {
		checkoutDB: 'training_plans',
		sessionId,
		event: 'checkout.succeeded',
		status: 'paid',
		country: country,
	});

	return NextResponse.json({ ok: true });
}
