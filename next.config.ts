import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
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
        ]
    },
    env: {
        NEXT_PUBLIC_BASE_PATH: '/community-events',
    },
};

export default nextConfig;
