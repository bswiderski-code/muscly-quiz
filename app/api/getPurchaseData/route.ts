import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const checkout = await prisma.trainingPlan.findUnique({
      where: { sid: sessionId },
      select: {
        id: true,
        name: true,
        email: true,
        amount: true,
        currency: true,
        description: true,
      },
    });

    if (!checkout) {
      return NextResponse.json({ error: 'Purchase data not found' }, { status: 404 });
    }

    return NextResponse.json({
      item_id: checkout.id,
      item_name: checkout.description || 'plan',
      price: checkout.amount,
      currency: checkout.currency || 'PLN',
      amount: checkout.amount,
      name: checkout.name,
      email: checkout.email,
    });
  } catch (error) {
    console.error('Error fetching purchase data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
