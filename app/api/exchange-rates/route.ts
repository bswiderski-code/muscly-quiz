import { NextResponse } from 'next/server';
import { forceRefreshRates, getCacheInfo } from '@/lib/conversionRates';

/**
 * API Route to manage exchange rates
 * 
 * GET /api/exchange-rates - Get cache information
 * POST /api/exchange-rates - Force refresh rates from API
 */

export async function GET() {
    try {
        const cacheInfo = getCacheInfo();

        return NextResponse.json({
            success: true,
            cache: {
                isValid: cacheInfo.isValid,
                lastUpdated: cacheInfo.lastUpdated?.toISOString() || null,
                nextUpdate: cacheInfo.nextUpdate?.toISOString() || null,
            },
        });
    } catch (error) {
        console.error('Error getting cache info:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get cache info' },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        console.log('[API] Manual refresh of exchange rates requested');
        const success = await forceRefreshRates();

        if (success) {
            const cacheInfo = getCacheInfo();
            return NextResponse.json({
                success: true,
                message: 'Exchange rates updated successfully',
                cache: {
                    isValid: cacheInfo.isValid,
                    lastUpdated: cacheInfo.lastUpdated?.toISOString() || null,
                    nextUpdate: cacheInfo.nextUpdate?.toISOString() || null,
                },
            });
        } else {
            return NextResponse.json(
                { success: false, error: 'Failed to update rates from API' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error refreshing rates:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
