import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const userData = await (prisma as any).userData.findFirst({
      where: { sid: sessionId },
    });

    if (!userData) {
      return NextResponse.json({ error: 'Purchase data not found' }, { status: 404 });
    }

    const order = await (prisma as any).orders.findFirst({
      where: { userId: userData.id },
    });

    if (!order) {
      // Only UserData exists (pending payment or order creation failed)
      // We might not have amount/currency here if we rely on Orders for it.
      // However, the frontend might need this to display "You bought X".
      // If order is missing, we can partial return or return what we have.
      // But typically this endpoint is called on the Thank You page.
      // If status is paid, order should exist.
      return NextResponse.json({
        item_id: userData.id,
        item_name: userData.item || 'workout',
        price: 0, // Unknown without order
        currency: 'PLN', // Default
        amount: 0,
        name: userData.name,
        email: userData.email,
      });
    }

    return NextResponse.json({
      item_id: userData.id,
      item_name: userData.item || 'workout',
      price: Number(order.amount), // Convert Decimal to number
      currency: order.currency || 'PLN',
      amount: Number(order.amount),
      name: userData.name,
      email: userData.email,
      pdfToken: order.pdfToken,
      item: order.item,
    });
  } catch (error) {
    console.error('Error fetching purchase data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

