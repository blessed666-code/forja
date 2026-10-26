import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Figtree, IBM_Plex_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { applyMotionLevel } from '@/components/motion/motionLevel'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { PwaRegister } from '@/components/pwa/PwaRegister'
import { buildRootMetadata } from '@/lib/seo/metadata'
import { getGlobalJsonLdGraph, serializeJsonLd } from '@/lib/seo/schema'
import './globals.css'

const MOTION_SCRIPT = `(${applyMotionLevel.toString()})();window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',${applyMotionLevel.toString()});`

const bigShoulders = Big_Shoulders({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-big-shoulders',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-figtree',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-plex-mono',
})

export const metadata: Metadata = buildRootMetadata()

export const viewport: Viewport = {
  themeColor: '#0C0F0E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

interface RootLayoutProps {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers()
  const nonce = hdrs.get('x-nonce') ?? undefined
  const globalJsonLd = serializeJsonLd(getGlobalJsonLdGraph())

  return (
    <html lang="es-CO" suppressHydrationWarning className={`${bigShoulders.variable} ${figtree.variable} ${plexMono.variable}`}>
      <body className="bg-bg font-sans text-text antialiased">
        <Script id="arka-motion" strategy="beforeInteractive" nonce={nonce}>
          {MOTION_SCRIPT}
        </Script>
        <script id="forja-schema-jsonld" type="application/ld+json" nonce={nonce}>
          {globalJsonLd}
        </script>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink"
        >
          Saltar al contenido
        </a>
        <MotionProvider>
          {children}
          <PwaRegister />
        </MotionProvider>
      </body>
    </html>
  )
}
