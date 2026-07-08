/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
