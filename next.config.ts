import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const devEnv =
  process.env.NODE_ENV !== 'production'
    ? {
      // Dev-only: allow spoofing domain-based configuration while running on a different host.
      // Example:
      // DEV_URL=your-dev-host.com
      // SPOOFED=antrenortanc.ro
      DEV_URL: process.env.DEV_URL,
    }
    : {};

const securityHeaders = [
  // Prevent clickjacking / iframe embedding
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limit referrer info sent to third parties
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser feature access
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Disable IE/Edge compatibility mode
  { key: 'X-UA-Compatible', value: 'IE=edge' },
];

const nextConfig: NextConfig = {
  env: devEnv,
  experimental: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);