import { NextResponse } from 'next/server';

export async function GET() {
  // Minimal no-op service worker — exists only to satisfy browsers that
  // request /sw.js. Does NOT intercept fetches or touch any caches.
  const swContent = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
`;

  return new NextResponse(swContent, {
    headers: {
      'Content-Type': 'application/javascript',
      // no-cache: browser always revalidates, so any future change is picked up immediately.
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}