/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    instrumentationHook: true,
    // Native module: must be required at runtime from node_modules, not
    // bundled by webpack (the .node binding can't be inlined).
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
  // Real HTTP redirects (proper 308s, resolved before rendering) for the
  // product-id spellings people guess and the legacy /<product> routes.
  // Kept here rather than in page components: pages render dynamically
  // (locale cookie) behind app/loading.tsx, where a late redirect() can
  // only downgrade to a streamed client-side hop.
  async redirects() {
    return [
      { source: "/showcase/xai", destination: "/showcase/ai", permanent: true },
      { source: "/showcase/xapp", destination: "/showcase/xapps", permanent: true },
      { source: "/xability", destination: "/showcase/xability", permanent: true },
      { source: "/xsite", destination: "/showcase/xsite", permanent: true },
      { source: "/xapp", destination: "/showcase/xapps", permanent: true },
      { source: "/xai", destination: "/showcase/ai", permanent: true },
      { source: "/xauto", destination: "/showcase/xauto", permanent: true },
    ];
  },
};

export default nextConfig;
