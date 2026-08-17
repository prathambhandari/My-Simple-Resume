import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "unpdf", "mammoth"],
  allowedDevOrigins: ["192.168.1.100", "localhost"],
};

export default nextConfig;
