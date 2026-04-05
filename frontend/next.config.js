/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Site lives at /auto on the existing domain
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  async rewrites() {
    // Only add rewrites when no basePath is set (dev mode)
    if (process.env.NEXT_PUBLIC_BASE_PATH) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
