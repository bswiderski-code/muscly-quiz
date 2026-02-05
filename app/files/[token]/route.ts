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

const ITEM_TO_DIR: Record<string, string> = {
    workout_solo: 'training_plan',
    workout_bundle: 'training_plan',
    raport: 'diet',
    calisthenics_solo: 'training_plan',
    calisthenics_bundle: 'training_plan',
};

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    const { token } = await context.params;

    // Helper to generate HTML error response
    const returnErrorHtml = (locale: string = 'en', translations: any = null) => {
        let title = 'Problem loading your data.';
        let description = 'If the issue persists, please contact us at support@musclepals.com';

        // Try to use translations if available
        if (translations && translations.ResultPage) {
            title = translations.ResultPage.loadingErrorTitle || title;
            if (translations.ResultPage.loadingErrorHtml) {
                const email = 'support@musclepals.com';
                description = translations.ResultPage.loadingErrorHtml.replace(/{email}/g, email);
            }
        } else {
            // Fallback to loading en.json if translations not provided
            try {
                const enPath = path.join(process.cwd(), 'i18n', 'translations', 'en.json');
                if (fs.existsSync(enPath)) {
                    const enTrans = JSON.parse(fs.readFileSync(enPath, 'utf8'));
                    if (enTrans.ResultPage) {
                        title = enTrans.ResultPage.loadingErrorTitle || title;
                        if (enTrans.ResultPage.loadingErrorHtml) {
                            const email = 'support@musclepals.com';
                            description = enTrans.ResultPage.loadingErrorHtml.replace(/{email}/g, email);
                        }
                    }
                }
            } catch (e) {
                // Ignore fallback error
            }
        }

        const html = `
        <!DOCTYPE html>
        <html lang="${locale}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f9fafb;
                    color: #111827;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    max-width: 500px;
                    width: 100%;
                }
                h1 {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    margin-top: 0;
                }
                p {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #4b5563;
                }
                a {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .icon {
                    margin-bottom: 24px;
                    font-size: 48px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">⚠️</div>
                <h1>${title}</h1>
                <p>${description}</p>
            </div>
        </body>
        </html>
        `;

        return new NextResponse(html, {
            status: 404, // Using 404 to indicate not found/error but displaying friendly UI
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    };

    if (!token) {
        return returnErrorHtml('en');
    }

    const order = await prisma.orders.findUnique({
        where: { pdfToken: token },
    });

    if (!order) {
        return returnErrorHtml('en');
    }

    // Determine locale from country
    const locale = getLocaleFromCountry(order.country);
    // Use the stored country (e.g., 'PL', 'US')
    const country = (order.country || 'PL').toUpperCase();

    // Load translation to get base filename and for error page
    let baseName = 'File';
    let translations: any = null;

    try {
        const filePath = path.join(process.cwd(), 'i18n', 'translations', `${locale}.json`);
        if (fs.existsSync(filePath)) {
            translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

    // Determine directory: training-plan or diet
    const dir = ITEM_TO_DIR[order.item] || 'training-plan';

    // Construct final S3 key: [directory]/[country]/[base]_[order_id].pdf
    // e.g., training-plan/PL/Plan_treningowy_1234.pdf
    const s3Key = `${dir}/${country}/${baseName}_${order.id}.pdf`;
    const downloadName = `${baseName}_${order.id}.pdf`;

    // Initialize S3
    const s3Config = PAYMENT_CREDENTIALS.s3;
    if (!s3Config.credentials.accessKeyId || !s3Config.credentials.secretAccessKey) {
        console.error('S3 credentials missing');
        return returnErrorHtml(locale, translations);
    }

    const s3 = new S3Client({
        region: s3Config.region,
        endpoint: s3Config.endpoint,
        credentials: s3Config.credentials,
        forcePathStyle: true,
    });

    // Log the generated key for debugging
    console.log(`[DEBUG] Fetching: Bucket=${s3Config.bucket}, Key=${s3Key}, Region=${s3Config.region}`);

    try {
        const command = new GetObjectCommand({
            Bucket: s3Config.bucket,
            Key: s3Key,
        });

        const response = await s3.send(command);

        if (!response.Body) {
            console.error(`S3 response body is empty for key: ${s3Key}`);
            return returnErrorHtml(locale, translations);
        }

        const stream = response.Body.transformToWebStream();

        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `inline; filename="${downloadName}"`);
        if (response.ContentLength) {
            headers.set('Content-Length', response.ContentLength.toString());
        }

        return new NextResponse(stream, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        // Handle missing file explicitly
        if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
            console.error(`File missing in S3: ${s3Key}`);
            return returnErrorHtml(locale, translations);
        }

        console.error(`S3 Fetch Error for key ${s3Key}:`, error);
        return returnErrorHtml(locale, translations);
    }
}
