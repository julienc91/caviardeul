const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // No next/image in the app: skip the optimizer and keep sharp (~37 MB) out
  // of the standalone build
  images: { unoptimized: true },
  allowedDevOrigins: baseUrl ? [new URL(baseUrl).hostname] : [],
  outputFileTracingExcludes: {
    "*": ["node_modules/sharp/**", "node_modules/@img/**"],
  },
};

module.exports = nextConfig;
