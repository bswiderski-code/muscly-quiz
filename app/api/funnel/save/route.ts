// app/api/funnel/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sid, funnel, ...answers } = body;

    if (!sid) {
      return NextResponse.json({ error: 'Missing sid' }, { status: 400 });
    }

    // Helper to safely parse numbers
    const parseNumber = (val: any) => {
      if (val == null) return null;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const normalized = val.replace(',', '.');
        const n = parseFloat(normalized);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const data: any = {
      amount: 0,
      currency: 'PLN',
      status: 'abandoned', // Initial status when funnel ends but no payment started
      name: (answers.name as string) ?? null,
      email: (answers.email as string) ?? null,
      age: parseNumber(answers.age),
      gender: (answers.gender as string) ?? null,
      activity: (answers.activity as string) ?? null,
      bmi: parseNumber(answers.bmi),
      tdee: parseNumber(answers.tdee),
      bodyfat: (answers.bodyfat as string) ?? null,
      diet_goal: (answers.diet_goal as string) ?? null,
      frequency: parseNumber(answers.frequency),
      experience: (answers.experience || null) as string,
      location: (answers.location as string) ?? null,
      priority: (answers.priority as string) ?? null,
      equipment: (answers.equipment as string) ?? null,
      sleep: (answers.sleep as string) ?? null,
      fitness_level: parseNumber(answers.fitness),
      difficulty: (answers.difficulty as string) ?? null,
      weight: parseNumber(answers.weight),
      height: parseNumber(answers.height),
      duration: parseNumber(answers.duration),
      pushups: (answers.pushups as string) ?? null,
      pullups: (answers.pullups as string) ?? null,
    };

    // Upsert the training plan based on sid
    const plan = await prisma.trainingPlan.upsert({
      where: { sid: sid },
      update: data,
      create: { ...data, sid: sid },
    });

    return NextResponse.json({ success: true, id: plan.id });
  } catch (err: any) {
    console.error('Error saving funnel data:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
