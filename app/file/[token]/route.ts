import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { PAYMENT_CREDENTIALS } from '@/config/credentials';
import { getLocaleFromCountry } from '@/lib/i18n/localeUtils';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const ITEM_TO_KEY: Record<string, string> = {
    workout_solo: 'workout',
    workout_bundle: 'workout',
    raport: 'raport',
    calisthenics_solo: 'calisthenics',
    calisthenics_bundle: 'calisthenics',
};

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    const { token } = await context.params;

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const order = await prisma.orders.findUnique({
        where: { pdfToken: token },
    });

    if (!order) {
        return NextResponse.json({ error: 'File not found or invalid token' }, { status: 404 });
    }

    // Determine locale from country
    const locale = getLocaleFromCountry(order.country);

    // Load translation to get base filename
    let baseName = 'File';
    try {
        const filePath = path.join(process.cwd(), 'i18n', 'translations', `${locale}.json`);
        if (fs.existsSync(filePath)) {
            const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const key = ITEM_TO_KEY[order.item];
            if (key && translations.PdfFilenames && translations.PdfFilenames[key]) {
                baseName = translations.PdfFilenames[key];
            } else if (locale !== 'en') {
                // Fallback to English if key missing in current locale
                const enPath = path.join(process.cwd(), 'i18n', 'translations', 'en.json');
                if (fs.existsSync(enPath)) {
                    const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
                    if (enTranslations.PdfFilenames && enTranslations.PdfFilenames[key]) {
                        baseName = enTranslations.PdfFilenames[key];
                    }
                }
            }
        }
    } catch (e) {
        console.error('Failed to load translations for PDF filename:', e);
    }

    // Construct final filename: [base]_[order_id].pdf
    const fileKey = `${baseName}_${order.id}.pdf`;

    // Initialize S3
    const s3Config = PAYMENT_CREDENTIALS.s3;
    if (!s3Config.credentials.accessKeyId || !s3Config.credentials.secretAccessKey) {
        console.error('S3 credentials missing');
        return NextResponse.json({ error: 'File not available' }, { status: 500 });
    }

    const s3 = new S3Client({
        region: s3Config.region,
        endpoint: s3Config.endpoint,
        credentials: s3Config.credentials,
        forcePathStyle: true,
    });

    try {
        const command = new GetObjectCommand({
            Bucket: s3Config.bucket,
            Key: fileKey,
        });

        const response = await s3.send(command);

        if (!response.Body) {
            return NextResponse.json({ error: 'Empty file' }, { status: 500 });
        }

        const stream = response.Body.transformToWebStream();

        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        // Disposition: inline ensures it opens in browser
        headers.set('Content-Disposition', `inline; filename="${fileKey}"`);
        if (response.ContentLength) {
            headers.set('Content-Length', response.ContentLength.toString());
        }

        return new NextResponse(stream, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error(`S3 Fetch Error for key ${fileKey}:`, error);
        return NextResponse.json({ error: 'Failed to fetch file' }, { status: 404 });
    }
}
