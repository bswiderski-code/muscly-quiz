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

const nextConfig: NextConfig = {
  env: devEnv,
  experimental: {
  }
  // Usuwamy rewrites - next-intl to obsłuży
  // Ewentualnie inne konfiguracje, jeśli masz (np. images)
};

export default withNextIntl(nextConfig);