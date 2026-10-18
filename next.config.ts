import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy server-side ke wilayah.id (API-nya tidak mengirim header CORS)
        source: "/api/wilayah/:path*",
        destination: "https://wilayah.id/api/:path*",
      },
    ];
  },
};

export default nextConfig;
