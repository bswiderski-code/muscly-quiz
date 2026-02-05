import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { getIncomingHost } from '@/lib/domain/incomingHost';
import { getEffectiveHost } from '@/lib/domain/effectiveHost';
import { CANONICAL_HOST } from '@/config/site';

export default async function middleware(request: NextRequest) {
  const hostHeader = getIncomingHost(request.headers) ?? '';
  const effectiveHost = getEffectiveHost(hostHeader) ?? hostHeader;
  const hostForChecks = effectiveHost.toLowerCase();

  // Local dev exception: localhost, *.local, etc.
  const isLocalDev =
    hostForChecks.endsWith('.local') ||
    hostForChecks.includes('localhost') ||
    hostForChecks.includes('127.0.0.1') ||
    hostForChecks.includes('.local:');

  const canonicalHost = CANONICAL_HOST;

  // 1. Production rule: Enforce canonical host.
  if (!isLocalDev && hostForChecks !== canonicalHost) {
    const proto = (request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '') ?? 'https')
      .split(',')[0]
      ?.trim();
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = `${proto}:`;
    redirectUrl.host = canonicalHost;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // 2. Skip next-intl for S3 proxy files
  if (request.nextUrl.pathname.startsWith('/file/')) {
    return NextResponse.next();
  }

  // 3. Uruchomienie logiki next-intl. 
  // Z 'localePrefix: always' w routing.ts, next-intl zajmie się wykrywaniem 
  // języka (np. z nagłówka Accept-Language) i przekierowaniem na /[locale]/.
  const handleI18nRouting = createMiddleware(routing);
  const response = handleI18nRouting(request);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};