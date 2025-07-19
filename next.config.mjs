/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    domains: ['blob.vercel-storage.com', 'placeholder.svg'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.svg',
      }
    ],
  },
  // Asegurar que CSS se compile correctamente
  swcMinify: true,
  // Configuración para producción
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
