import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get('sessionId'); // Replace sessionId with sid

  if (!sid) {
    return NextResponse.json({ success: false, error: 'Missing sid' }, { status: 400 });
  }

  const raport = await prisma.trainingPlan.findUnique({
    where: { sid }, // Replace sessionId with sid
    select: { status: true },
  });

  if (!raport) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  if (raport.status === 'paid') {
    return NextResponse.json({ success: true });
  }

  // Treat everything except 'paid' as failed
  return NextResponse.json({ success: false });
}