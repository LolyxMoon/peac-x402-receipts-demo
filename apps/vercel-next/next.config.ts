import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isPreview = process.env.VERCEL_ENV !== 'production';
    const headers = [];

    // Block preview deployments from search engines
    if (isPreview) {
      headers.push({
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      });
    }

    // Security and SEO headers for all environments
    headers.push(
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      }
    );

    return headers;
  },
};

export default nextConfig;
