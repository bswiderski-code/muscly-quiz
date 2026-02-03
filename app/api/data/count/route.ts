// app/api/data/count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCachedResultStats } from '@/lib/db/stats';

export async function GET(req: NextRequest) {
  try {
    const { recentCount, totalCount } = await getCachedResultStats();
    return NextResponse.json({ recentCount, totalCount });
  } catch (err) {
    console.error('Failed to fetch cached stats:', err);
    return NextResponse.json({ recentCount: null, totalCount: null }, { status: 500 });
  }
}