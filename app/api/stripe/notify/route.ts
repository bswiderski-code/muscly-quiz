import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { sendToN8n } from '@/lib/n8n';
import { getBaseUrl } from '@/lib/requestBaseUrl';
import { getCountryForHost } from '@/i18n/config';
import { getIncomingHost } from '@/lib/domain/incomingHost';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover', // Use a standard API version
});

export async function GET(req: Request) {
  const origin = await getBaseUrl();
  const host = getIncomingHost(req.headers);
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) return NextResponse.redirect(`${origin}/fallback`);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.client_reference_id) {
      const internalSessionId = session.client_reference_id;
      // Get actual country from host/domain config
      const country = getCountryForHost(host);

      // FIX 2: Use an Interactive Transaction
      // This ensures that EITHER everything happens OR nothing happens.
      // If Order creation fails, the Plan status rolls back to 'pending'.
      const transactionResult = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Try to update. Returns 0 if already paid.
        const updateResult = await tx.trainingPlan.updateMany({
          where: {
            sid: internalSessionId,
            status: { not: 'paid' } // The atomic lock
          },
          data: { status: 'paid' },
        });

        // If we didn't update anything, it means it was already processed.
        // Return null to signal "do nothing".
        if (updateResult.count === 0) return null;

        // 2. Fetch the plan details needed for the order
        // We fetch inside transaction to ensure consistency
        const checkout = await tx.trainingPlan.findUnique({
            where: { sid: internalSessionId }
        });
        
        if (!checkout) throw new Error("Plan missing during transaction");

        // 3. Create the order
        const order = await tx.orders.create({
          data: {
            item: checkout.description ?? 'plan',
            name: checkout.name ?? '',
            email: checkout.email ?? '',
            checkoutId: checkout.id,
            checkoutDB: 'training_plans',
            sessionId: checkout.sid,
            amount: Math.round(checkout.amount * 100),
            currency: checkout.currency ?? 'USD',
            country: country,
            payment_provider: 'Stripe',
            paymentId: checkout.paymentId ?? session.id,
          },
        });

        return { order, checkout };
      });

      // FIX 3: Send Webhook OUTSIDE the DB transaction
      // We only send this if transactionResult is not null (meaning we just processed it)
      if (transactionResult) {
        try {
          await sendToN8n(process.env.N8N_WEBHOOK_URL!, 'checkout.succeeded', {
            checkoutDB: 'training_plans',
            sessionId: internalSessionId,
            event: 'checkout.succeeded',
            status: 'paid',
            country: country,
            usedMetric: session.metadata?.usedMetric,
            waga_raw: session.metadata?.waga_raw,
            waga_cel_raw: session.metadata?.waga_cel_raw,
            wzrost_raw: session.metadata?.wzrost_raw,
          });
        } catch (webhookError) {
          // Log webhook failure, but don't fail the request 
          // because the DB is already updated and money is paid.
          console.error('N8n Webhook failed', webhookError);
        }
      }

      return NextResponse.redirect(`${origin}/result/order/${internalSessionId}`);
    } 
    
    // Handle cases where session exists but not paid yet
    if (session.client_reference_id) {
       return NextResponse.redirect(`${origin}/result/order/${session.client_reference_id}`);
    }

  } catch (error) {
    console.error('Error checking stripe session:', error);
  }

  return NextResponse.redirect(`${origin}`);
}