import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeGenderMF } from '@/lib/gender/normalizeGenderMF';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import { getCountryForHost, getCountryForLocale } from '@/i18n/config';

export async function POST(req: NextRequest) {
  // Extract host for market determination
  const host = getIncomingHost(req.headers);

  try {
    const body = await req.json();
    const { sid, funnel, locale, ...answers } = body;

    const country = locale ? getCountryForLocale(locale as any) : getCountryForHost(host);

    if (!sid) {
      return NextResponse.json({ error: 'Missing sid' }, { status: 400 });
    }

    // Helper to safely parse numbers
    const parseNumber = (val: any) => {
      if (val == null) return 0;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const normalized = val.replace(',', '.');
        const n = parseFloat(normalized);
        return Number.isFinite(n) ? n : 0;
      }
      return 0;
    };

    // Prepare UserData fields
    const userDataUpdate = {
      name: (answers.name as string) ?? '',
      email: (answers.email as string) ?? '',
      status: 'pending', // or keep existing status if upserting? typically 'pending' for funnel save
      item: 'workout_solo', // Default or derived? The original code didn't specify item well for funnel save.
      country: country,
    };

    // Prepare HealthDetails fields
    const genderMF = normalizeGenderMF(answers.gender);
    const healthDetailsData = {
      gender: genderMF === 'M' ? 'M' : 'F',
      activity: (answers.activity as any) ?? 'some_activity',
      bmi: parseNumber(answers.bmi),
      tdee: parseNumber(answers.tdee),
      bodyfat: (answers.bodyfat as string) ?? '',
      diet_goal: (answers.diet_goal as any) ?? 'cut',
      frequency: parseNumber(answers.frequency),
      experience: (answers.experience as any) ?? 'just_started',
      location: (answers.location as any) ?? 'house',
      priority: (answers.priority as string) ?? '',
      equipment: (answers.equipment as string) ?? '',
      sleep: (answers.sleep as string) ?? '',
      fitness_level: parseNumber(answers.fitness),
      difficulty: (answers.difficulty as any) ?? 'no_difficulty',
      weight: parseNumber(answers.weight),
      height: parseNumber(answers.height),
      duration: parseNumber(answers.duration),
      pushups: (answers.pushups as string) ?? '0',
      pullups: (answers.pullups as string) ?? '0',
      cardio: answers.cardio === 'yes' || answers.cardio === true ? true : false,
      balance: (answers.balance as any) ?? 'balance',
      age: parseNumber(answers.age),
    };

    // Upsert UserData + associated HealthDetails
    // We cannot easily upsert deep relations in one go if HealthDetails uses userId as PK.
    // Logic: 
    // 1. Find or create UserData.
    // 2. Upsert HealthDetails using userData.id.

    const result = await prisma.$transaction(async (tx: any) => {
      // Upsert UserData
      let user = await tx.userData.findFirst({ where: { sid } });

      if (user) {
        user = await tx.userData.update({
          where: { id: user.id },
          data: userDataUpdate as any // Partial update
        });
      } else {
        user = await tx.userData.create({
          data: {
            sid,
            ...userDataUpdate
          } as any
        });
      }

      // Upsert HealthDetails
      await tx.healthDetails.upsert({
        where: { userId: user.id },
        update: healthDetailsData as any,
        create: {
          userId: user.id,
          ...healthDetailsData
        } as any
      });

      return user;
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (err: any) {
    console.error('Error saving funnel data:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
