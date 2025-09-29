// FILE: next.config.mjs

import createNextIntlPlugin from 'next-intl/plugin';

// Point the next-intl plugin to your i18n configuration file.
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the workaround for Next.js 15 + Turbopack compatibility.
  experimental: {
    turbo: {},
  },
  
  // Your other configurations remain unchanged.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);