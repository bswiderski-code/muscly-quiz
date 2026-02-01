import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeCredentials } from '@/config/credentials';
import { processStripeSession } from '@/lib/stripe/orderProcessor';
import { getIncomingHost } from '@/lib/domain/incomingHost';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const isSandbox = process.env.STRIPE_SANDBOX === 'true';
    const creds = getStripeCredentials(isSandbox);

    if (!creds.webhookSecret) {
        console.error('Stripe webhook secret is missing in credentials config.');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const stripe = new Stripe(creds.secretKey, {
        apiVersion: '2026-01-28.clover',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, creds.webhookSecret);
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
