import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: {
    position: 'top-right',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/gh/JahelCuadrado/ExerciseGymGifsDB/**',
      },
    ],
  },
}

export default nextConfig
