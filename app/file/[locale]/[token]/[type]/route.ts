import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { PAYMENT_CREDENTIALS } from '@/config/credentials';
import { getLocaleFromCountry } from '@/lib/i18n/localeUtils';
import { getSupportEmail } from '@/lib/i18n/emailUtils';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const TYPE_TO_DIR: Record<string, string> = {
    workout: 'training_plan',
    diet: 'diet',
};

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ locale: string; token: string; type: string }> }
) {
    const { locale: urlLocale, token, type } = await context.params;

    // Helper to generate HTML error response
    const returnErrorHtml = (locale: string = 'en', translations: any = null) => {
        let title = 'Problem loading your data.';
        let description = `If the issue persists, please contact us at ${getSupportEmail(locale)}`;

        if (translations && translations.ResultPage) {
            title = translations.ResultPage.loadingErrorTitle || title;
            if (translations.ResultPage.loadingErrorHtml) {
                const email = getSupportEmail(locale);
                description = translations.ResultPage.loadingErrorHtml.replace(/{email}/g, email);
            }
        } else {
            try {
                const enPath = path.join(process.cwd(), 'i18n', 'translations', 'en.json');
                if (fs.existsSync(enPath)) {
                    const enTrans = JSON.parse(fs.readFileSync(enPath, 'utf8'));
                    if (enTrans.ResultPage) {
                        title = enTrans.ResultPage.loadingErrorTitle || title;
                        if (enTrans.ResultPage.loadingErrorHtml) {
                            const email = getSupportEmail(locale);
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
            status: 404,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    };

    if (!token || !type) {
        return returnErrorHtml(urlLocale || 'en');
    }

    if (type !== 'workout' && type !== 'diet') {
        return returnErrorHtml(urlLocale || 'en');
    }

    const order = await prisma.order.findUnique({
        where: { pdfToken: token },
    });

    if (!order) {
        return returnErrorHtml(urlLocale || 'en');
    }

    // Access control logic
    const item = order.item;
    let hasAccess = false;

    if (type === 'workout') {
        // Workout access for all solo/bundle workout items
        if (['workout_solo', 'workout_bundle'].includes(item)) {
            hasAccess = true;
        }
    } else if (type === 'diet') {
        // Diet access for bundles or solo raport item
        if (['workout_bundle', 'raport'].includes(item)) {
            hasAccess = true;
        }
    }

    if (!hasAccess) {
        return returnErrorHtml(urlLocale || 'en'); // or custom "No access" page
    }

    // Determine locale: use URL locale if provided, otherwise fall back to country lookup
    let locale: string;
    if (urlLocale) {
        locale = urlLocale;
    } else {
        // Fallback: lookup from database country
        locale = getLocaleFromCountry(order.country);
    }

    const country = (order.country || 'PL').toUpperCase();

    // Load translation to get base filename
    let baseName = 'File';
    let translations: any = null;

    try {
        const filePath = path.join(process.cwd(), 'i18n', 'translations', `${locale}.json`);
        if (fs.existsSync(filePath)) {
            translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Determine translation key
            let transKey = type; // default to 'workout' or 'diet'

            if (translations.PdfFilenames && translations.PdfFilenames[transKey]) {
                baseName = translations.PdfFilenames[transKey];
            } else {
                // Special mapping for 'diet' if key is 'raport' in translations
                const effectiveKey = (transKey === 'diet' && !translations.PdfFilenames?.diet) ? 'raport' : transKey;

                if (translations.PdfFilenames && translations.PdfFilenames[effectiveKey]) {
                    baseName = translations.PdfFilenames[effectiveKey];
                } else {
                    // Fallback to English
                    const enPath = path.join(process.cwd(), 'i18n', 'translations', 'en.json');
                    if (fs.existsSync(enPath)) {
                        const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
                        const enEffectiveKey = (transKey === 'diet' && !enTranslations.PdfFilenames?.diet) ? 'raport' : transKey;

                        if (enTranslations.PdfFilenames && enTranslations.PdfFilenames[enEffectiveKey]) {
                            baseName = enTranslations.PdfFilenames[enEffectiveKey];
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error('Failed to load translations for PDF filename:', e);
    }

    const dir = TYPE_TO_DIR[type];
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

    console.log(`[DEBUG] Fetching: Bucket=${s3Config.bucket}, Key=${s3Key}, Type=${type}, Item=${item}, Locale=${locale}`);

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
        if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
            console.error(`File missing in S3: ${s3Key}`);
            return returnErrorHtml(locale, translations);
        }

        console.error(`S3 Fetch Error for key ${s3Key}:`, error);
        return returnErrorHtml(locale, translations);
    }
}
