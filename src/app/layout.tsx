import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Figtree, IBM_Plex_Mono } from 'next/font/google'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { applyMotionLevel } from '@/components/motion/motionLevel'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { PwaRegister } from '@/components/pwa/PwaRegister'
import './globals.css'

const MOTION_SCRIPT = `(${applyMotionLevel.toString()})();window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',${applyMotionLevel.toString()});`

const bigShoulders = Big_Shoulders({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-big-shoulders',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-figtree',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'FORJA',
    template: '%s · FORJA',
  },
  description: 'Entrena los días que elegiste. Con exigencia. Una muestra de ARKA · aliado NAIU.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FORJA',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
}

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es-CO" suppressHydrationWarning className={`${bigShoulders.variable} ${figtree.variable} ${plexMono.variable}`}>
      <body className="bg-bg font-sans text-text antialiased">
        <Script id="arka-motion" strategy="beforeInteractive">
          {MOTION_SCRIPT}
        </Script>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink"
        >
          Saltar al contenido
        </a>
        <MotionProvider>
          <SmoothScroll lerp={0.1} />
          {children}
          <PwaRegister />
        </MotionProvider>
      </body>
    </html>
  )
}
