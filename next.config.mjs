/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // Pin the tracing root (a stray parent lockfile otherwise confuses Next).
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
