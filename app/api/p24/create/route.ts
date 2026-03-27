import { NextRequest, NextResponse } from 'next/server';
import {
  P24,
  Currency,
  Country,
  Language,
  Encoding,
} from '@ingameltd/node-przelewy24';

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, getRealBaseUrl } from '@/lib/requestBaseUrl';
import { getMarketForHost, getCountryForHost, getMarketForLocale, getCountryForLocale } from '@/i18n/config';
import { normalizeGenderMF } from '@/lib/gender/normalizeGenderMF';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

import { getP24 } from '@/lib/paymentClients';

export async function POST(req: NextRequest) {
  const rl = rateLimit(`p24-create:${getClientIp(req)}`, { max: 10, windowSecs: 900 });
  if (!rl.allowed) return rateLimitResponse(rl);

  const p24 = getP24();

  // Extract host for market determination
  const host = getIncomingHost(req.headers);

  try {
    const body = await req.json();
    const {
      amountPln, email, description, productName, name,
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

    // Calculate BMI (weight in kg, height in cm)
    let bmi = 0;
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

    const parsedWeight = parseNumber(weight);
    const parsedHeightCm = parseNumber(height);
    const parsedAge = parseNumber(age);
    let tdee = 0;
    if (parsedWeight > 0 && parsedHeightCm > 0) {
      const heightM = parsedHeightCm / 100;
      bmi = +(parsedWeight / (heightM * heightM)).toFixed(1);
      // Calculate TDEE (same as TDEEBOX)
      // Activity multipliers
      const activityMap: Record<string, number> = {
        // short keys only
        "low_activity": 1.2,
        "some_activity": 1.35,
        "light_training": 1.5,
        "regular_training": 1.7,
        "hard_work": 1.9,
      };
      const activityMult = activityMap[String(activity)] || 1.5;
      let bmr = 0;
      const genderMF = normalizeGenderMF(gender);
      if (!isNaN(parsedWeight) && !isNaN(parsedHeightCm) && !isNaN(parsedAge)) {
        if (genderMF === 'F') {
          bmr = 10 * parsedWeight + 6.25 * parsedHeightCm - 5 * parsedAge - 161;
        } else if (genderMF === 'M') {
          bmr = 10 * parsedWeight + 6.25 * parsedHeightCm - 5 * parsedAge + 5;
        } else {
          // Unknown / missing gender: do not compute TDEE
          bmr = 0;
        }
      }
      tdee = Math.round(bmr * activityMult);
    }

    if (!amountPln || !email) {
      return NextResponse.json(
        { error: 'Wymagane: amountPln i email' },
        { status: 400 }
      );
    }

    const sessionId = randomUUID();
    const origin = await getBaseUrl(market.locale as any);
    const realOrigin = (await getRealBaseUrl()) || origin;

    const order = {
      sessionId,
      amount: Math.round(Number(amountPln) * 100), // e.g. 1,23 => 123
      currency: (market.currency.toUpperCase() as Currency) || Currency.PLN,
      description: (typeof productName === 'string' && productName.trim()) ? productName.trim() : (description || 'workout'),
      email,
      country: (market.market.toUpperCase() as Country) || Country.Poland,
      language: (market.locale.toUpperCase() as Language) || Language.PL,
      urlReturn: `${realOrigin}/result/order/${sessionId}`,
      urlStatus: `${realOrigin}/api/p24/notify`,
      timeLimit: 0,
      encoding: Encoding.UTF8,
    } as const;

    const { link, token: paymentId } = await p24.createTransaction(order);
    const genderMF = normalizeGenderMF(gender);

    await prisma.$transaction(async (tx: any) => {
      // Create UserData associated with this checkout session
      const userData = await tx.userData.create({
        data: {
          sid: sessionId,
          status: 'pending',
          name: name ?? '',
          email: email,
          item: description?.includes('bundle') ? 'workout_bundle' : 'workout_solo', // simple heuristic
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

    return NextResponse.json({ url: link, paymentId, sessionId });
  } catch (err: unknown) {
    console.error('P24 error:', err);
    return NextResponse.json(
      { error: 'Payment session could not be created.' },
      { status: 500 }
    );
  }
}

