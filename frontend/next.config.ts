import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const baseUrl = rawBackendUrl.replace(/\/api\/:path\*$/, '').replace(/\/+$/, '');
    const destination = baseUrl.endsWith('/api') ? `${baseUrl}/:path*` : `${baseUrl}/api/:path*`;

    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/:path*',
          destination,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
