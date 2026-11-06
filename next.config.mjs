/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  },
  async redirects() {
    return [
      { source: "/ar", destination: "/payments", permanent: false },
      { source: "/churn", destination: "/customers", permanent: false },
      { source: "/leads", destination: "/customers", permanent: false },
      { source: "/inventory/:path*", destination: "/customers", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
