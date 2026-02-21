import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const rl = rateLimit(`purchase:${getClientIp(req)}`, { max: 30, windowSecs: 60 });
  if (!rl.allowed) return rateLimitResponse(rl);

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId || !UUID_RE.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
  }

  try {
    const userData = await (prisma as any).userData.findFirst({
      where: { sid: sessionId },
    });

    if (!userData) {
      return NextResponse.json({ error: 'Purchase data not found' }, { status: 404 });
    }

    const order = await (prisma as any).order.findFirst({
      where: { userId: userData.id },
    });

    const item = order?.item || userData.item || 'workout_solo';
    const standardizedItemName = item === 'workout_bundle'
      ? 'Workout plan + diet analysis'
      : 'Workout plan';
    const standardizedItemId = item === 'workout_bundle'
      ? 'workout_bundle'
      : 'workout_solo';

    return NextResponse.json({
      item_id: standardizedItemId,
      item_name: standardizedItemName,
      price: order ? Number(order.amount) : 0,
      currency: order?.currency || 'PLN',
      amount: order ? Number(order.amount) : 0,
      name: userData.name,
      email: userData.email,
      pdfToken: order?.pdfToken,
      item: item,
      country: userData.country || 'PL',
    });
  } catch (error) {
    console.error('Error fetching purchase data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

