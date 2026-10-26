import type { Metadata } from 'next'

const FALLBACK_PRODUCTION_URL = 'https://forja.vercel.app'
const FALLBACK_DEVELOPMENT_URL = 'http://localhost:3000'

/**
 * Resuelve el origen canónico público del despliegue sin exponer variables privadas.
 * Prioriza NEXT_PUBLIC_SITE_URL (ignorando localhost en producción), luego los
 * dominios inyectados automáticamente por Vercel.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const isProd = process.env.NODE_ENV === 'production'

  if (explicit && !(isProd && explicit.includes('localhost'))) {
    return explicit.replace(/\/+$/, '')
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProd) {
    return `https://${vercelProd.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  }

  const vercelPreview = process.env.VERCEL_URL?.trim()
  if (vercelPreview) {
    return `https://${vercelPreview.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  }

  return isProd ? FALLBACK_PRODUCTION_URL : FALLBACK_DEVELOPMENT_URL
}

export const FORJA_SEO = {
  siteName: 'FORJA',
  brandName: 'FORJA · ARKA Fitness AI',
  locale: 'es_CO',
  defaultTitle: 'FORJA · Rutinas de Gym y Nutrición Funcional en Bogotá',
  titleTemplate: '%s · FORJA',
  defaultDescription:
    'Arma tu rutina determinista de 3, 4 o 5 días en Bogotá con blindaje articular, cálculo de macros y superalimentos NAIU. Empieza hoy con FORJA por ARKA.',
  ogImage: {
    url: '/og/forja-og.png',
    width: 1200,
    height: 630,
    alt: 'FORJA · Rutinas deterministas de gimnasio, blindaje articular y nutrición funcional por ARKA',
    type: 'image/png',
  },
  arkaOrganization: {
    name: 'ARKA',
    url: 'https://arkadigital.co',
    city: 'Bogotá',
    country: 'CO',
  },
  naiuPartnerUrl: 'https://naiu.bio',
} as const

export interface PageMetadataOptions {
  title: string
  description: string
  path: `/${string}` | '/'
  noIndex?: boolean
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl()
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()

  return {
    metadataBase: new URL(siteUrl),
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
    applicationName: FORJA_SEO.siteName,
    title: {
      default: FORJA_SEO.defaultTitle,
      template: FORJA_SEO.titleTemplate,
    },
    description: FORJA_SEO.defaultDescription,
    authors: [{ name: FORJA_SEO.arkaOrganization.name, url: FORJA_SEO.arkaOrganization.url }],
    creator: FORJA_SEO.arkaOrganization.name,
    publisher: FORJA_SEO.arkaOrganization.name,
    category: 'fitness',
    manifest: '/manifest.webmanifest',
    alternates: {
      canonical: '/',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: FORJA_SEO.siteName,
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      locale: FORJA_SEO.locale,
      url: siteUrl,
      siteName: FORJA_SEO.siteName,
      title: FORJA_SEO.defaultTitle,
      description: FORJA_SEO.defaultDescription,
      images: [FORJA_SEO.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: FORJA_SEO.defaultTitle,
      description: FORJA_SEO.defaultDescription,
      images: [FORJA_SEO.ogImage.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
  }
}

export function buildPageMetadata({ title, description, path, noIndex = false }: PageMetadataOptions): Metadata {
  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '')
  const fullTitle = `${title} · ${FORJA_SEO.siteName}`

  return {
    title,
    description,
    alternates: {
      canonical: normalizedPath,
    },
    openGraph: {
      type: 'website',
      locale: FORJA_SEO.locale,
      url: normalizedPath,
      siteName: FORJA_SEO.siteName,
      title: fullTitle,
      description,
      images: [FORJA_SEO.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [FORJA_SEO.ogImage.url],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        },
  }
}
