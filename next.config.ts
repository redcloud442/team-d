const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN", // Allows embedding within the same origin
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "connect-src 'self' https://mromobfjpmxcrgyrjpbn.supabase.co; " +
              "frame-src 'self' https://mromobfjpmxcrgyrjpbn.supabase.co; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "object-src 'none'; " +
              "img-src 'self' data: blob:; " +
              "media-src 'self' blob:; " +
              "font-src 'self' data:;",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
