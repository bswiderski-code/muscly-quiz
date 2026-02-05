import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { sendToN8n } from '@/lib/n8n';
import Stripe from 'stripe';
import { getCountryForHost } from '@/i18n/config';

// Shared type for the result of processing
export type StripeProcessingResult = {
    processed: boolean;
    order?: any;
    userData?: any;
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
        const updateResult = await (tx as any).userData.updateMany({
            where: {
                sid: sessionId,
                status: { not: 'paid' },
            },
            data: { status: 'paid' },
        });

        // 2. Fetch the userData to verify existence and get data for Order
        const userData = await (tx as any).userData.findFirst({
            where: { sid: sessionId },
        });

        if (!userData) {
            // Plan missing entirely
            return null;
        }

        // If we didn't update (already paid), check if Order exists.
        // If Order exists, we do nothing. If not, we might want to create it (repair),
        // but typically if it's 'paid', the order should be there.
        if (updateResult.count === 0) {
            // It was already paid. Let's see if we need to return 'already_paid'
            return { action: 'already_paid', userData };
        }

        // 3. Create the Order (since we just transitioned to 'paid')
        // UserData doesn't have amount/currency, so we get it from the session
        const order = await (tx as any).orders.create({
            data: {
                item: userData.item,
                userId: userData.id,
                amount: new Prisma.Decimal((session.amount_total ?? 0) / 100) as any,
                currency: session.currency?.toUpperCase() ?? 'USD',
                country: country,
                payment_provider: 'Stripe',
                delivered: false
            },
        });

        return { action: 'processed', order, userData };
    });

    if (!transactionResult) {
        // Plan missing
        return { processed: false, status: 'failed' };
    }

    if (transactionResult.action === 'already_paid') {
        return { processed: true, status: 'already_paid', userData: transactionResult.userData };
    }

    // If we processed it, send the webhook
    if (transactionResult.action === 'processed') {
        try {
            await sendToN8n(process.env.N8N_WEBHOOK_URL!, 'checkout.succeeded', {
                checkoutDB: 'user_data',
                sessionId: sessionId,
                event: 'checkout.succeeded',
                status: 'paid',
                country: country,
                item: transactionResult.userData?.item,
                email: transactionResult.userData?.email,
                name: transactionResult.userData?.name,
                amount: (session.amount_total ?? 0) / 100,
                currency: session.currency?.toUpperCase(),
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
            userData: transactionResult.userData
        };
    }

    return { processed: false, status: 'failed' };
}

