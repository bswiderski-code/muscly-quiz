import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

/**
 * Fetches and caches total orders count.
 * Revalidates every 10 minutes (600 seconds).
 */
export const getTotalOrdersCount = unstable_cache(
    async () => {
        return await prisma.orders.count();
    },
    ['total-orders-count'],
    {
        revalidate: 600, // 10 minutes
        tags: ['stats', 'total-orders'],
    }
);

/**
 * Fetches and caches recent orders count (last 24 hours).
 * Revalidates every 5 minutes (300 seconds).
 */
export const getRecentOrdersCount = unstable_cache(
    async () => {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await prisma.orders.count({
            where: {
                createdAt: {
                    gte: since,
                },
            },
        });
    },
    ['recent-orders-count'],
    {
        revalidate: 300, // 5 minutes
        tags: ['stats', 'recent-orders'],
    }
);

/**
 * Legacy wrapper for backward compatibility if needed, 
 * but routes should ideally call the specific functions.
 */
export const getCachedResultStats = async () => {
    const [totalCount, recentCount] = await Promise.all([
        getTotalOrdersCount(),
        getRecentOrdersCount(),
    ]);
    return { totalCount, recentCount };
};
