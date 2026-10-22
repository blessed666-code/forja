import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FORJA · App de Entreno',
    short_name: 'FORJA',
    description: 'Entrena los días que elegiste. Con exigencia. Una muestra de ARKA · aliado NAIU.',
    start_url: '/hoy',
    display: 'standalone',
    background_color: '#0C0F0E',
    theme_color: '#0C0F0E',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
