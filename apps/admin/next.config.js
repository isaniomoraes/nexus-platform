/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@nexus/ui", "@nexus/database", "@nexus/auth", "@nexus/shared"],
  experimental: {
    optimizeFonts: false, // Fallback if font loading fails
  },
}

module.exports = nextConfig
