import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, getRealBaseUrl } from '@/lib/requestBaseUrl';
import { getCountryForHost, getMarketForHost } from '@/i18n/config';
import { normalizeGenderMF } from '@/lib/gender/normalizeGenderMF';
import { getIncomingHost } from '@/lib/domain/incomingHost';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(req: Request) {
  // Extract host for market determination
  const host = getIncomingHost(req.headers);
  const market = getMarketForHost(host);
  const country = getCountryForHost(host);

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
    } = body;

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

    const session = await stripe.checkout.sessions.create({
      // Enable card (covers Apple Pay / Google Pay / regular cards),
      // Revolut Pay, Link, and Klarna where available.
      payment_method_types: ['card', 'revolut_pay', 'klarna'],
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

    await prisma.trainingPlan.create({
      data: {
        sid: sessionId,
        amount: amount,
        description: description || 'plan',
        currency: String(safeCurrency).toUpperCase(),
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
        paymentId: session.id,
        paymenturl: session.url ?? null,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe error:', error);
    const message = error instanceof Error ? error.message : 'Stripe error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
