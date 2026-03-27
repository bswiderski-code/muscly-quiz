import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, getStripeWebhookSecret } from '@/lib/paymentClients';
import { processStripeSession } from '@/lib/stripe/orderProcessor';
import { getIncomingHost } from '@/lib/domain/incomingHost';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let webhookSecret: string;
    try {
        webhookSecret = getStripeWebhookSecret();
    } catch {
        console.error('STRIPE_WEBHOOK_SECRET is not set.');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const stripe = getStripe();

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`⚠️  Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const host = getIncomingHost(req.headers);

        // Process the completed session
        await processStripeSession(session, host);
    }

    return NextResponse.json({ received: true });
}
