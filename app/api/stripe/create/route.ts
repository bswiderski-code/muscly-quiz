import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, getRealBaseUrl } from '@/lib/requestBaseUrl';
import { getCountryForHost, getMarketForHost, getMarketForLocale, getCountryForLocale } from '@/i18n/config';
import { normalizeGenderMF } from '@/lib/gender/normalizeGenderMF';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

import { getStripeCredentials } from '@/config/credentials';
import { Prisma } from '@prisma/client';

const isSandbox = process.env.STRIPE_SANDBOX === 'true';
const creds = getStripeCredentials(isSandbox);

const stripe = new Stripe(creds.secretKey, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(`stripe-create:${getClientIp(req)}`, { max: 10, windowSecs: 900 });
  if (!rl.allowed) return rateLimitResponse(rl);

  // Extract host for market determination
  const host = getIncomingHost(req.headers);

  try {
    const body = await req.json();
    const {
      amount,
      currency,
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
      equipment,
      fitness,
      duration,
      pushups,
      pullups,
      calistenic_experience,
      usedMetric,
      weight_raw,
      weight_goal_raw,
      height_raw,
      cardio,
      locale,
    } = body;

    const market = locale ? getMarketForLocale(locale as any) : getMarketForHost(host);
    const country = locale ? getCountryForLocale(locale as any) : getCountryForHost(host);

    // Helper to safely parse numbers
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

    let bmi = 0;
    let tdee = 0;

    const genderMF = normalizeGenderMF(gender);

    if (parsedWeight > 0 && parsedHeightCm > 0) {
      const heightM = parsedHeightCm / 100;
      bmi = +(parsedWeight / (heightM * heightM)).toFixed(1);

      // Calculate TDEE
      const activityMap: Record<string, number> = {
        "low_activity": 1.2,
        "some_activity": 1.35,
        "light_training": 1.5,
        "regular_training": 1.7,
        "hard_work": 1.9,
      };
      const activityMult = activityMap[String(activity)] || 1.5;
      let bmr = 0;
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

    if (!amount || !email) {
      return NextResponse.json(
        { error: 'Required: amount and email' },
        { status: 400 }
      );
    }

    const sessionId = randomUUID();
    // Convert amount to cents
    const unitAmount = Math.round(amount * 100);

    const safeCurrency = (typeof currency === 'string' && currency.trim() ? currency.trim().toLowerCase() : (market.currency.toLowerCase() || 'usd'));
    const safeProductName =
      (typeof productName === 'string' && productName.trim())
        ? productName.trim()
        : (typeof description === 'string' && description.trim())
          ? description.trim()
          : 'Product';

    const origin = await getBaseUrl();
    const realOrigin = (await getRealBaseUrl()) || origin;

    // Payment methods vary by currency.
    // PLN (Poland): card + BLIK + Klarna (Przelewy24 disabled).
    // Other currencies: card + Revolut Pay + Klarna.
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
      safeCurrency === 'pln'
        ? ['card', 'blik', 'klarna']
        : ['card', 'revolut_pay', 'klarna'];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      client_reference_id: sessionId,
      line_items: [
        {
          price_data: {
            currency: safeCurrency,
            product_data: {
              name: safeProductName,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${realOrigin}/api/stripe/notify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${realOrigin}/api/stripe/notify?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: email,
      metadata: {
        sessionId: sessionId,
        country: country,
        usedMetric: String(usedMetric ?? ''),
        weight_raw: String(weight_raw ?? ''),
        weight_goal_raw: String(weight_goal_raw ?? ''),
        height_raw: String(height_raw ?? ''),
      }
    });

    await prisma.$transaction(async (tx: any) => {
      // Create UserData associated with this checkout session
      const userData = await tx.userData.create({
        data: {
          sid: sessionId,
          status: 'pending',
          name: name ?? '',
          email: email,
          item: description.includes('bundle') ? 'workout_bundle' : 'workout_solo', // simple heuristic, refine if needed
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

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Payment session could not be created.' }, { status: 500 });
  }
}

