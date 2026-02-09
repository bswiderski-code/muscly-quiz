import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocaleFromCountry } from '@/lib/i18n/localeUtils';

export const dynamic = 'force-dynamic';

/**
 * Legacy route handler for backward compatibility.
 * Redirects /file/[token]/[type] to /file/[locale]/[token]/[type]
 * where locale is determined from the order's country in the database.
 */
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ token: string; type: string }> }
) {
    const { token, type } = await context.params;

    if (!token || !type) {
        return new NextResponse('Invalid request', { status: 400 });
    }

    // Look up the order to determine the locale
    const order = await prisma.order.findUnique({
        where: { pdfToken: token },
        select: { country: true },
    });

    if (!order) {
        // If order not found, default to 'en' locale
        const redirectUrl = new URL(req.url);
        redirectUrl.pathname = `/file/en/${token}/${type}`;
        return NextResponse.redirect(redirectUrl, 301);
    }

    // Determine locale from country
    const locale = getLocaleFromCountry(order.country);

    // Redirect to the new URL structure with locale
    const redirectUrl = new URL(req.url);
    redirectUrl.pathname = `/file/${locale}/${token}/${type}`;
    return NextResponse.redirect(redirectUrl, 301);
}
