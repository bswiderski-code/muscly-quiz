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
  const pathname = request.nextUrl.pathname;

  // Local dev exception: localhost, *.local, etc.
  const isLocalDev =
    hostForChecks.endsWith('.local') ||
    hostForChecks.includes('localhost') ||
    hostForChecks.includes('127.0.0.1') ||
    hostForChecks.includes('.local:');

  const canonicalHost = CANONICAL_HOST.toLowerCase();

  // 1. Production rule: Enforce canonical host.
  if (
    canonicalHost &&
    !isLocalDev &&
    hostForChecks !== canonicalHost
  ) {
    const proto = (request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '') ?? 'https')
      .split(',')[0]
      ?.trim();
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = `${proto}:`;
    redirectUrl.host = CANONICAL_HOST;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // 2. Skip next-intl for S3 proxy files (both legacy and new locale-based routes)
  if (pathname.startsWith('/file/')) {
    return NextResponse.next();
  }

  // 3. Technical issues mode — manual override via env var.
  //    Redirects every page to /{locale}/technical-issues.
  //    Skip if already on the technical-issues page to avoid redirect loops.
  const isMaintenance = process.env.TECHNICAL_ISSUES_MODE === 'true';
  if (isMaintenance && !pathname.includes('/technical-issues')) {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] ?? '';
    const locale = routing.locales.includes(firstSegment as any) ? firstSegment : routing.defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/technical-issues`;
    return NextResponse.redirect(redirectUrl, 307);
  }

  // 4. Run next-intl locale routing.
  const handleI18nRouting = createMiddleware(routing);
  const i18nResponse = handleI18nRouting(request);

  // If next-intl is issuing a redirect (e.g. to add locale prefix), pass it through.
  if (i18nResponse.status >= 300 && i18nResponse.status < 400) {
    return i18nResponse;
  }

  // 5. Inject the current pathname as a request header so server-side layouts
  //    can read it (e.g. to skip the DB health check on /technical-issues).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};