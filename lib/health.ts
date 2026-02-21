import { prisma } from '@/lib/prisma';

/**
 * Checks if the database is reachable.
 * Returns true if healthy, false if the DB is down or times out.
 */
export async function checkDbHealth(): Promise<boolean> {
  try {
    await Promise.race([
      (prisma as any).$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('db_timeout')), 2000)
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}
