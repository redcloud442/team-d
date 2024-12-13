import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevents embedding your site in iframes (clickjacking protection)
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevents MIME type sniffing
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';", // Adds extra protection against clickjacking
          },
        ],
      },
    ];
  },
};

export default nextConfig;
