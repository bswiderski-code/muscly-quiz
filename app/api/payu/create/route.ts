import { NextRequest, NextResponse } from 'next/server';
import { PayU, Currency, Order } from '@ingameltd/payu';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, getRealBaseUrl } from '@/lib/requestBaseUrl';
import { getCountryForHost, getMarketForHost, getMarketForLocale, getCountryForLocale } from '@/i18n/config';
import { normalizeGenderMF } from '@/lib/gender/normalizeGenderMF';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

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
	return code || 'Personalizowany plan treningowy';
};

export async function POST(req: NextRequest) {
	const rl = rateLimit(`payu-create:${getClientIp(req)}`, { max: 10, windowSecs: 900 });
	if (!rl.allowed) return rateLimitResponse(rl);

	// Extract host for market determination
	const host = getIncomingHost(req.headers);

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
			cardio,
			locale,
		} = body;

		const market = locale ? getMarketForLocale(locale as any) : getMarketForHost(host);
		const country = locale ? getCountryForLocale(locale as any) : getCountryForHost(host);

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
		const origin = await getBaseUrl(market.locale as any);
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
			continueUrl: `${realOrigin}/result/order/${sessionId}`,
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

		await prisma.$transaction(async (tx: any) => {
			// Create UserData associated with this checkout session
			const userData = await tx.userData.create({
				data: {
					sid: sessionId,
					status: 'pending',
					name: name ?? '',
					email: email,
					item: description?.includes('bundle') ? 'workout_bundle' : 'workout_solo',
					country: country,
				}
			});

			// Create HealthDetails
			await tx.healthDetails.create({
				data: {
					userId: userData.id,
					gender: genderMF === 'M' ? 'M' : 'F',
					activity: (activity as any) ?? 'some_activity',
					bmi: bmi || 0,
					tdee: Number.isFinite(tdee) && tdee > 0 ? Math.round(tdee) : 0,
					bodyfat: (bodyfat as string) ?? '',
					diet_goal: (diet_goal as any) ?? 'cut',
					frequency: frequency ? Math.round(parseNumber(frequency)) : 3,
					experience: (experience as any) ?? 'just_started',
					location: (location as any) ?? 'house',
					priority: (priority as string) ?? '',
					equipment: (equipment as string) ?? '',
					sleep: (sleep as string) ?? '',
					fitness_level: fitness ? Math.round(parseNumber(fitness)) : 5,
					difficulty: (difficulty as any) ?? 'no_difficulty',
					weight: parsedWeight || 0,
					height: parsedHeightCm || 0,
					duration: duration ? Math.round(parseNumber(duration)) : 30,
					pushups: (pushups as string) ?? '0',
					pullups: (pullups as string) ?? '0',
					cardio: cardio === true || cardio === 'true',
					age: Math.round(parsedAge) || 0,
				}
			});
		});

		return NextResponse.json({ url: redirectUri, paymentId: orderId, sessionId });
	} catch (err: unknown) {
		console.error('PayU error:', err);
		return NextResponse.json({ error: 'Payment session could not be created.' }, { status: 500 });
	}
}

