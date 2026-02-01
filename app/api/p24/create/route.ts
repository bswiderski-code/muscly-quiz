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
import { getMarketForHost } from '@/i18n/config';
import { normalizeGenderMF } from '@/lib/gender/normalizeGenderMF';
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
      usedMetric
    } = body;

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
    const origin = await getBaseUrl(market.locale);
    const realOrigin = (await getRealBaseUrl()) || origin;

    const order = {
      sessionId,
      amount: Math.round(Number(amountPln) * 100), // e.g. 1,23 => 123
      currency: (market.currency.toUpperCase() as Currency) || Currency.PLN,
      description: (typeof productName === 'string' && productName.trim()) ? productName.trim() : (description || 'workout'),
      email,
      country: (market.market.toUpperCase() as Country) || Country.Poland,
      language: (market.locale.toUpperCase() as Language) || Language.PL,
      urlReturn: `${realOrigin}/wynik/zamowienie/${sessionId}`,
      urlStatus: `${realOrigin}/api/p24/notify`,
      timeLimit: 0,
      encoding: Encoding.UTF8,
    } as const;

    const { link, token: paymentId } = await p24.createTransaction(order);
    // removed checkout.created webhook — we only emit `checkout.succeeded` from the notify endpoint

    // Save the checkout data into the TrainingPlan model (mapped to DB table `training_plans`).
    // Map incoming Polish fields to the schema's English field names.
    await prisma.trainingPlan.create({
      data: {
        sid: sessionId,
        // order.amount is in grosze (e.g. 123 for 1.23 PLN) — store as Float PLN
        amount: order.amount / 100,
        description: description || 'workout', // use incoming description from frontend
        currency: String(order.currency),
        status: 'pending',
        name: name ?? '',
        email,
        age: Math.round(parsedAge) || null,
        gender: normalizeGenderMF(gender),
        activity: (activity as string) ?? null,
        bmi: bmi || null,
        // store computed TDEE as rounded integer, or null if unavailable/non-positive
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
        paymentId,
        paymenturl: link,
      },
    });

    return NextResponse.json({ url: link, paymentId, sessionId });
  } catch (err: unknown) {
    let message = 'Błąd P24';
    if (err instanceof Error) {
      message = err.message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
