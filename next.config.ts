import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: false,
      },
      {
        source: "/beneficiary",
        destination: "/dashboard/beneficiaire",
        permanent: false,
      },
      {
        source: "/beneficiary/dashboard",
        destination: "/dashboard/beneficiaire",
        permanent: false,
      },
      {
        source: "/mentor",
        destination: "/dashboard/mentor",
        permanent: false,
      },
      {
        source: "/expert",
        destination: "/dashboard/expert",
        permanent: false,
      },
      {
        source: "/partenaire",
        destination: "/dashboard/partenaire",
        permanent: false,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
