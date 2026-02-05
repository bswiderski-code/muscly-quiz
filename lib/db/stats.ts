import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

/**
 * Fetches and caches result page statistics.
 * - recentCount: reports with status 'paid' created in the last 24 hours.
 * - totalCount: all reports with status 'paid'.
 * 
 * Revalidates every 10 minutes (600 seconds).
 */
export const getCachedResultStats = unstable_cache(
    async () => {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [recentCount, totalCount] = await Promise.all([
            prisma.userData.count({
                where: {
                    status: 'paid',
                    createdAt: {
                        gte: since,
                    },
                },
            }),
            prisma.userData.count({
                where: {
                    status: 'paid',
                },
            }),
        ]);

        return { recentCount, totalCount };
    },
    ['result-page-stats'],
    {
        revalidate: 600, // 10 minutes
        tags: ['stats'],
    }
);
