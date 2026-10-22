// FORJA Service Worker (PWA Offline-First)
const CACHE_NAME = 'forja-pwa-v1'
const PRECACHE_ASSETS = [
  '/',
  '/hoy',
  '/semana',
  '/biblioteca',
  '/coach',
  '/perfil',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Cache-first para ejercicios (GIFs en CDN jsDelivr) e imágenes
  const url = event.request.url
  if (url.includes('cdn.jsdelivr.net') || event.request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached
        try {
          const response = await fetch(event.request)
          if (response && response.status === 200) {
            cache.put(event.request, response.clone())
          }
          return response
        } catch {
          return cached || new Response('Offline asset', { status: 503 })
        }
      }),
    )
    return
  }

  // Network-first con fallback a cache para la interfaz
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/hoy'))),
  )
})
