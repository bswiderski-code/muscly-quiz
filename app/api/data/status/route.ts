import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const rl = rateLimit(`status:${getClientIp(req)}`, { max: 30, windowSecs: 60 });
  if (!rl.allowed) return rateLimitResponse(rl);

  const { searchParams } = new URL(req.url);
  const sid = searchParams.get('sessionId');

  if (!sid || !UUID_RE.test(sid)) {
    return NextResponse.json({ success: false, error: 'Invalid session ID' }, { status: 400 });
  }

  const raport = await (prisma as any).userData.findFirst({
    where: { sid },
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