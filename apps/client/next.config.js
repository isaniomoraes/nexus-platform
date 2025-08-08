/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nexus/ui', '@nexus/database', '@nexus/auth', '@nexus/shared'],
}

module.exports = nextConfig
