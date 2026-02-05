import { PrismaClient, OrderItem, UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

// Load env vars
dotenv.config();

const prisma = new PrismaClient();

// Minimal sendToN8n implementation for script usage
async function sendToN8n(url: string, event: string, data: any) {
    const secret = process.env.N8N_WEBHOOK_SECRET;
    const payload = { event, ...data };
    const body = JSON.stringify(payload);

    let signature = '';
    if (secret) {
        signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    }

    const headers: Record<string, string> = {
        'content-type': 'application/json',
    };

    if (signature) {
        headers['x-n8n-signature'] = signature;
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body,
        });
        console.log(`N8N Webhook status: ${res.status}`);
    } catch (err) {
        console.error('N8n fetch error:', err);
    }
}

async function main() {
    console.log('--- Order Conversion Script ---');

    // 1. Find the last UserData (last checkout attempt)
    const lastUser = await prisma.userData.findFirst({
        orderBy: {
            id: 'desc',
        },
        include: {
            orders: true
        }
    });

    if (!lastUser) {
        console.error('No users found in database.');
        return;
    }

    console.log(`Found last user: ${lastUser.name} (${lastUser.email}), SID: ${lastUser.sid}, ID: ${lastUser.id}`);

    if (lastUser.status === 'paid') {
        console.warn('The last checkout is already marked as paid.');
        // Check if order exists
        if (lastUser.orders.length > 0) {
            console.warn('Order already exists for this user. Aborting to avoid duplicates.');
            return;
        }
        console.log('No order found for this paid user, proceeding to create one.');
    }

    // 2. Transact (Update status and Create order)
    const result = await prisma.$transaction(async (tx) => {
        // 2a. Update status to paid
        await tx.userData.update({
            where: { id: lastUser.id },
            data: { status: 'paid' as UserStatus },
        });

        // 2b. Create order
        // We use some defaults for amount/currency since we don't have payu/stripe session data here
        const order = await tx.orders.create({
            data: {
                item: lastUser.item,
                userId: lastUser.id,
                amount: 39.00, // Default price approximation if unknown
                currency: 'PLN', // Default currency
                country: lastUser.country || 'PL',
                payment_provider: 'MANUAL_CONVERT',
                delivered: false,
                pdfToken: uuidv4(),
            },
        });

        return order;
    });

    console.log('Database updated successfully.');
    console.log(`Order created: ID ${result.id}, Transaction Amount: ${result.amount} ${result.currency}`);

    // 3. Send N8N Webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
        console.log('Sending N8N Webhook...');
        await sendToN8n(webhookUrl, 'checkout.succeeded', {
            checkoutDB: 'user_data',
            sessionId: lastUser.sid,
            event: 'checkout.succeeded',
            status: 'paid',
            country: lastUser.country || 'PL',
            item: lastUser.item,
            email: lastUser.email,
            name: lastUser.name,
            amount: 39.00,
            currency: 'PLN',
        });
        console.log('Webhook sent.');
    } else {
        console.warn('N8N_WEBHOOK_URL not set, skipping webhook.');
    }

    console.log('--- Conversion Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
