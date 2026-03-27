import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { sendToN8n } from '@/lib/n8n';
import { getBaseUrl } from '@/lib/requestBaseUrl';
import { getCountryForHost } from '@/i18n/config';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import { processStripeSession } from '@/lib/stripe/orderProcessor';

import { getStripe } from '@/lib/paymentClients';

export async function GET(req: Request) {
  const origin = await getBaseUrl();
  const host = getIncomingHost(req.headers);
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) return NextResponse.redirect(`${origin}/fallback`);

  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Use shared logic - this is idempotent.
    // If webhook came first, this will return 'already_paid'.
    // If this comes first, it will process and return 'paid'.
    const result = await processStripeSession(session, host);

    if (result.processed && result.status !== 'failed') {
      const internalSessionId = session.client_reference_id;
      // Success - redirect to results page
      return NextResponse.redirect(`${origin}/result/order/${internalSessionId}`);
    }

    // Check if session has a client reference but wasn't processed successfully (e.g. failed or pending)
    if (session.client_reference_id) {
      // It might be 'unpaid' or failed processing.
      // We redirect to the result page anyway; if status is pending, the UI will show pending.
      return NextResponse.redirect(`${origin}/result/order/${session.client_reference_id}`);
    }

  } catch (error) {
    console.error('Error checking stripe session:', error);
  }
  return NextResponse.redirect(`${origin}`);
}