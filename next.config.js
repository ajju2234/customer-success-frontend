/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a minimal standalone server bundle for the Docker image.
  output: "standalone",
  reactStrictMode: true,
  // ESLint is not configured in this project; type-checking still runs.
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
