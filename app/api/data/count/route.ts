// app/api/data/count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Calculate date 24 hours ago
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Count reports with status="paid" created in last 24 hours
    const recentCount = await prisma.trainingPlan.count({
      where: {
        status: 'paid',
        createdAt: {
          gte: since,
        },
      },
    });

    // Count all reports with status="paid"
    const totalCount = await prisma.trainingPlan.count({
      where: {
        status: 'paid',
      },
    });

    return NextResponse.json({ recentCount, totalCount });
  } catch (err) {
    return NextResponse.json({ recentCount: null, totalCount: null }, { status: 500 });
  }
}