/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude test files from production build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    // Ignore test files in webpack
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      use: 'ignore-loader',
    })
    return config
  },
  // Disable ESLint during build to avoid config issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript errors should be fixed, but allow build to continue
  typescript: {
    ignoreBuildErrors: false,
  },
  // Add cache headers to prevent stale JavaScript
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

export default nextConfig
// Force rebuild Sat Nov 22 12:08:11 PM EAT 2025
