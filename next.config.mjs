/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-da9cec840809483ea83a2e1dee014a3e.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Para avatares de Google
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Por si usas placeholders
      }
    ],
  },
}

export default nextConfig
