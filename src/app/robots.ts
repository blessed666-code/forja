import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/metadata'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: ['Googlebot', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot'],
        allow: '/',
        disallow: ['/api/', '/admin', '/acceso'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/acceso'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
