import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Some versions bundle it under experimental
  },
  // @ts-ignore - explicitly enabling network IP dev server bypassing strict turbopack CORS rules
  allowedDevOrigins: ['192.168.1.100', 'localhost'],
};

export default nextConfig;
