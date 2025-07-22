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
    unoptimized: true,
  },
  // Configuración para manejar rutas 404 correctamente
  async redirects() {
    return [
      {
        source: '/_not-found',
        destination: '/404',
        permanent: false,
      },
    ]
  },
  // Configuración adicional para evitar conflictos
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

export default nextConfig
