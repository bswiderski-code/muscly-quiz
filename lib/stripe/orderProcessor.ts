import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { sendToN8n } from '@/lib/n8n';
import Stripe from 'stripe';
import { getCountryForHost } from '@/i18n/config';

// Shared type for the result of processing
export type StripeProcessingResult = {
    processed: boolean;
    order?: any;
    checkout?: any;
    status: 'paid' | 'already_paid' | 'failed' | 'ignored';
};

export async function processStripeSession(
    session: Stripe.Checkout.Session,
    host: string | null
): Promise<StripeProcessingResult> {
    if (session.payment_status !== 'paid') {
        return { processed: false, status: 'ignored' };
    }

    const sessionId = session.client_reference_id;
    if (!sessionId) {
        return { processed: false, status: 'ignored' };
    }

    const country = getCountryForHost(host);

    // Idempotent Transaction
    const transactionResult = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Try to update status from !paid -> paid.
        // If this returns count: 0, either the record doesn't exist OR it's already paid.
        const updateResult = await tx.trainingPlan.updateMany({
            where: {
                sid: sessionId,
                status: { not: 'paid' },
            },
            data: { status: 'paid' },
        });

        // 2. Fetch the plan details to verify existence and get data for Order
        // 2. Fetch the plan details to verify existence and get data for Order
        const checkout = await tx.trainingPlan.findUnique({
            where: { sid: sessionId },
        });

        if (!checkout) {
            // Plan missing entirely
            return null;
        }

        // If we didn't update (already paid), check if Order exists.
        // If Order exists, we do nothing. If not, we might want to create it (repair),
        // but typically if it's 'paid', the order should be there.
        if (updateResult.count === 0) {
            // It was already paid. Let's see if we need to return 'already_paid'
            return { action: 'already_paid', checkout };
        }

        // 3. Create the Order (since we just transitioned to 'paid')
        const order = await tx.orders.create({
            data: {
                item: checkout.description ?? 'workout',
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

        return { action: 'processed', order, checkout };
    });

    if (!transactionResult) {
        // Plan missing
        return { processed: false, status: 'failed' };
    }

    if (transactionResult.action === 'already_paid') {
        return { processed: true, status: 'already_paid', checkout: transactionResult.checkout };
    }

    // If we processed it, send the webhook
    if (transactionResult.action === 'processed') {
        try {
            await sendToN8n(process.env.N8N_WEBHOOK_URL!, 'checkout.succeeded', {
                checkoutDB: 'training_plans',
                sessionId: sessionId,
                event: 'checkout.succeeded',
                status: 'paid',
                country: country,
                usedMetric: session.metadata?.usedMetric,
                waga_raw: session.metadata?.waga_raw,
                waga_cel_raw: session.metadata?.waga_cel_raw,
                wzrost_raw: session.metadata?.wzrost_raw,
            });
        } catch (webhookError) {
            console.error('N8n Webhook failed', webhookError);
            // We still return success because the order is safe in DB
        }
        return {
            processed: true,
            status: 'paid',
            order: transactionResult.order,
            checkout: transactionResult.checkout
        };
    }

    return { processed: false, status: 'failed' };
}
