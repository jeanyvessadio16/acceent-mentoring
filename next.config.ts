import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
