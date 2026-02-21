import type { NextConfig } from 'next';

const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  ...(!isVercel && { output: 'standalone' }),
  basePath: '/community-events',
  assetPrefix: '/community-events',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/community-events',
        permanent: true,
        basePath: false,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: '/community-events',
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
