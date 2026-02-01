import { NextRequest, NextResponse } from 'next/server';
import { PayU, Currency, Order } from '@ingameltd/payu';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, getRealBaseUrl } from '@/lib/requestBaseUrl';
import { getCountryForHost, getMarketForHost } from '@/i18n/config';
import { normalizeGenderMF } from '@/lib/gender/normalizeGenderMF';
import { getIncomingHost } from '@/lib/domain/incomingHost';

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

// Extract best-effort client IP; PayU rejects 0.0.0.0
const getClientIp = (req: NextRequest) => {
	const forwarded = req.headers.get('x-forwarded-for');
	if (forwarded) return forwarded.split(',')[0]?.trim();
	const real = req.headers.get('x-real-ip');
	if (real) return real.trim();
	return '127.0.0.1';
};

// Helper to safely parse numbers coming as string (with comma) or number
const parseNumber = (val: unknown) => {
	if (val == null) return 0;
	if (typeof val === 'number') return val;
	if (typeof val === 'string') {
		const normalized = val.replace(',', '.');
		const n = parseFloat(normalized);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
};

const normalizePlanDescription = (raw: unknown) => {
	const code = typeof raw === 'string' ? raw.trim() : '';
	if (code === 'workout_bundle') return 'Personalizowany plan treningowy + raport BMI';
	if (code === 'workout_solo') return 'Personalizowany plan treningowy';
	if (code === 'calisthenics_bundle') return 'Personalizowany plan kalisteniki + raport BMI';
	if (code === 'calisthenics_solo') return 'Personalizowany plan kalisteniki';
	return code || 'Personalizowany plan treningowy';
};

export async function POST(req: NextRequest) {
	// Extract host for market determination
	const host = getIncomingHost(req.headers);
	const market = getMarketForHost(host);

	try {
		const body = await req.json();
		const {
			amountPln,
			email,
			description,
			productName,
			name,
			experience,
			difficulty,
			height,
			weight,
			age,
			activity,
			diet_goal,
			gender,
			sleep,
			bodyfat,
			frequency,
			location,
			priority,
			fitness,
			equipment,
			duration,
			pushups,
			pullups,
			calistenic_experience,
			usedMetric,
		} = body;

		if (!amountPln || !email) {
			return NextResponse.json(
				{ error: 'Wymagane: amountPln i email' },
				{ status: 400 }
			);
		}

		// Calculate BMI (weight in kg, height in cm)
		let bmi = 0;
		const parsedWeight = parseNumber(weight);
		const parsedHeightCm = parseNumber(height);
		const parsedAge = parseNumber(age);
		let tdee = 0;
		const genderMF = normalizeGenderMF(gender);

		if (parsedWeight > 0 && parsedHeightCm > 0) {
			const heightM = parsedHeightCm / 100;
			bmi = +(parsedWeight / (heightM * heightM)).toFixed(1);
			// Activity multipliers
			const activityMap: Record<string, number> = {
				low_activity: 1.2,
				some_activity: 1.35,
				light_training: 1.5,
				regular_training: 1.7,
				hard_work: 1.9,
			};
			const activityMult = activityMap[String(activity)] || 1.5;
			let bmr = 0;
			if (!isNaN(parsedWeight) && !isNaN(parsedHeightCm) && !isNaN(parsedAge)) {
				if (genderMF === 'F') {
					bmr = 10 * parsedWeight + 6.25 * parsedHeightCm - 5 * parsedAge - 161;
				} else if (genderMF === 'M') {
					bmr = 10 * parsedWeight + 6.25 * parsedHeightCm - 5 * parsedAge + 5;
				}
			}
			tdee = Math.round(bmr * activityMult);
		}

		const sessionId = randomUUID();
		const origin = await getBaseUrl(market.locale);
		const realOrigin = (await getRealBaseUrl()) || origin;
		const totalAmount = Math.round(Number(amountPln) * 100);
		const normalizedDescription = (typeof productName === 'string' && productName.trim())
			? productName.trim()
			: normalizePlanDescription(description);

		const order: Order = {
			extOrderId: sessionId,
			notifyUrl: `${realOrigin}/api/payu/notify`,
			customerIp: getClientIp(req),
			validityTime: 8035200,
			continueUrl: `${realOrigin}/wynik/zamowienie/${sessionId}`,
			description: normalizedDescription,
			currencyCode: (market.currency as Currency) || Currency.PLN,
			totalAmount,
			buyer: {
				email,
				firstName: name ?? undefined,
			},
			products: [
				{
					name: normalizedDescription,
					quantity: 1,
					unitPrice: totalAmount,
					virtual: true,
				},
			],
		};

		const { redirectUri, orderId } = await payU.createOrder(order);

		await prisma.trainingPlan.create({
			data: {
				sid: sessionId,
				amount: totalAmount / 100,
				description: description,
				currency: String(order.currencyCode),
				status: 'pending',
				name: name ?? '',
				email,
				age: Math.round(parsedAge) || null,
				gender: genderMF,
				activity: (activity as string) ?? null,
				bmi: bmi || null,
				tdee: Number.isFinite(tdee) && tdee > 0 ? Math.round(tdee) : null,
				bodyfat: (bodyfat as string) ?? null,
				diet_goal: (diet_goal as string) ?? null,
				frequency: frequency ? Math.round(parseNumber(frequency)) : null,
				experience: (experience || calistenic_experience || null) as string,
				priority: (priority as string) ?? null,
				location: (location as string) ?? null,
				equipment: (equipment as string) ?? null,
				sleep: (sleep as string) ?? null,
				fitness_level: fitness ? Math.round(parseNumber(fitness)) : null,
				difficulty: (difficulty as string) ?? null,
				duration: duration ? Math.round(parseNumber(duration)) : null,
				pushups: (pushups as string) ?? null,
				pullups: (pullups as string) ?? null,
				weight: parsedWeight || null,
				height: parsedHeightCm || null,
				paymentId: orderId,
				paymenturl: redirectUri,
			},
		});

		return NextResponse.json({ url: redirectUri, paymentId: orderId, sessionId });
	} catch (err: unknown) {
		let message = 'Błąd PayU';
		if (err instanceof Error) {
			message = err.message;
		}
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
