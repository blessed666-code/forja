import { FORJA_SEO, getSiteUrl } from '@/lib/seo/metadata'

export interface SchemaOrganization {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  '@id': string
  name: string
  url: string
  areaServed: {
    '@type': 'City'
    name: string
    containedInPlace: {
      '@type': 'Country'
      name: string
    }
  }
  sameAs?: readonly string[]
}

export interface SchemaWebApplication {
  '@context': 'https://schema.org'
  '@type': 'WebApplication'
  '@id': string
  name: string
  alternateName: string
  url: string
  image: string
  description: string
  applicationCategory: 'HealthApplication'
  operatingSystem: string
  inLanguage: string
  browserRequirements: string
  featureList: readonly string[]
  creator: {
    '@type': 'Organization'
    '@id': string
    name: string
    url: string
  }
}

export interface SchemaService {
  '@context': 'https://schema.org'
  '@type': 'Service'
  '@id': string
  name: string
  serviceType: string
  description: string
  url: string
  provider: {
    '@type': 'Organization'
    '@id': string
    name: string
    url: string
  }
  areaServed: {
    '@type': 'Country'
    name: string
  }
}

export interface ExerciseGymOpeningHours {
  dayOfWeek: readonly string[]
  opens: string
  closes: string
}

export interface ExerciseGymSchemaInput {
  name: string
  url: string
  image: string
  telephone: string
  streetAddress: string
  addressLocality: string
  addressRegion?: string
  postalCode?: string
  priceRange?: string
  sameAs?: readonly string[]
  openingHours?: readonly ExerciseGymOpeningHours[]
}

export interface SchemaExerciseGym {
  '@context': 'https://schema.org'
  '@type': 'ExerciseGym'
  '@id': string
  name: string
  url: string
  image: string
  telephone: string
  address: {
    '@type': 'PostalAddress'
    streetAddress: string
    addressLocality: string
    addressRegion?: string
    postalCode?: string
    addressCountry: 'CO'
  }
  priceRange?: string
  sameAs?: readonly string[]
  openingHoursSpecification?: ReadonlyArray<{
    '@type': 'OpeningHoursSpecification'
    dayOfWeek: readonly string[]
    opens: string
    closes: string
  }>
}

export interface FaqEntry {
  question: string
  answer: string
}

export interface SchemaFaqPage {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: ReadonlyArray<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

export type JsonLdEntity =
  | SchemaOrganization
  | SchemaWebApplication
  | SchemaService
  | SchemaExerciseGym
  | SchemaFaqPage

export function buildOrganizationSchema(): SchemaOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${FORJA_SEO.arkaOrganization.url}/#organization`,
    name: FORJA_SEO.arkaOrganization.name,
    url: FORJA_SEO.arkaOrganization.url,
    areaServed: {
      '@type': 'City',
      name: FORJA_SEO.arkaOrganization.city,
      containedInPlace: {
        '@type': 'Country',
        name: FORJA_SEO.arkaOrganization.country,
      },
    },
  }
}

export function buildWebApplicationSchema(siteUrl: string = getSiteUrl()): SchemaWebApplication {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${siteUrl}/#webapp`,
    name: FORJA_SEO.siteName,
    alternateName: 'ARKA Fitness AI',
    url: siteUrl,
    image: `${siteUrl}${FORJA_SEO.ogImage.url}`,
    description: FORJA_SEO.defaultDescription,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web, iOS, Android',
    inLanguage: 'es-CO',
    browserRequirements: 'Requires JavaScript and HTML5 support',
    featureList: [
      'Asignación determinista de rutinas en 6 clusters oficiales (3, 4 o 5 días por semana)',
      'Modulador automático de tiempo para sesiones de 60, 90 o 120 minutos',
      'Diccionario de 26 slots biomecánicos con sustitución equivalente en vivo',
      'Blindaje articular preventivo para hombros, rodillas, codos y espalda baja',
      'Cálculo clínico de macronutrientes (Mifflin-St Jeor) con alimentos de plaza colombiana',
      'Recomendación funcional exclusiva de superalimentos NAIU (naiu.bio)',
    ],
    creator: {
      '@type': 'Organization',
      '@id': `${FORJA_SEO.arkaOrganization.url}/#organization`,
      name: FORJA_SEO.arkaOrganization.name,
      url: FORJA_SEO.arkaOrganization.url,
    },
  }
}

export function buildServiceSchema(siteUrl: string = getSiteUrl()): SchemaService {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}/#service`,
    name: 'FORJA — Plataforma PWA de Entrenamiento Determinista para Gimnasios',
    serviceType: 'Aplicación Web Progresiva de Entrenamiento y Nutrición Funcional',
    description:
      'Sistema de rutinas deterministas en código, biblioteca biomecánica y coach asistente personalizable en marca blanca para gimnasios en Bogotá y Colombia.',
    url: siteUrl,
    provider: {
      '@type': 'Organization',
      '@id': `${FORJA_SEO.arkaOrganization.url}/#organization`,
      name: FORJA_SEO.arkaOrganization.name,
      url: FORJA_SEO.arkaOrganization.url,
    },
    areaServed: {
      '@type': 'Country',
      name: FORJA_SEO.arkaOrganization.country,
    },
  }
}

/**
 * Constructor parametrizado para Fase 6.2 (Marca Blanca B2B).
 * Solo debe invocarse cuando el gimnasio cliente tenga sede física y NAP verificado
 * idéntico a su ficha de Google Business Profile (regla cero datos inventados).
 */
export function buildExerciseGymSchema(gym: ExerciseGymSchemaInput): SchemaExerciseGym {
  const cleanUrl = gym.url.replace(/\/+$/, '')

  return {
    '@context': 'https://schema.org',
    '@type': 'ExerciseGym',
    '@id': `${cleanUrl}/#exercisegym`,
    name: gym.name,
    url: cleanUrl,
    image: gym.image,
    telephone: gym.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: gym.streetAddress,
      addressLocality: gym.addressLocality,
      ...(gym.addressRegion ? { addressRegion: gym.addressRegion } : {}),
      ...(gym.postalCode ? { postalCode: gym.postalCode } : {}),
      addressCountry: 'CO',
    },
    ...(gym.priceRange ? { priceRange: gym.priceRange } : {}),
    ...(gym.sameAs && gym.sameAs.length > 0 ? { sameAs: gym.sameAs } : {}),
    ...(gym.openingHours && gym.openingHours.length > 0
      ? {
          openingHoursSpecification: gym.openingHours.map((slot) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: slot.dayOfWeek,
            opens: slot.opens,
            closes: slot.closes,
          })),
        }
      : {}),
  }
}

/**
 * Solo publicar en páginas cuyo HTML muestre exactamente estas mismas preguntas y respuestas.
 */
export function buildFaqSchema(entries: readonly FaqEntry[]): SchemaFaqPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function getGlobalJsonLdGraph(siteUrl: string = getSiteUrl()): readonly JsonLdEntity[] {
  return [
    buildOrganizationSchema(),
    buildWebApplicationSchema(siteUrl),
    buildServiceSchema(siteUrl),
  ]
}

/**
 * Serializa datos estructurados escapando `<` como `\u003c` para prevenir ruptura
 * de etiquetas `<script>` e inyección XSS.
 */
export function serializeJsonLd(data: JsonLdEntity | readonly JsonLdEntity[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
