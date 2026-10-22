export interface NaiuProduct {
  id: string
  name: string
  benefit?: string
  price?: string
  url: string
}

export const NAIU_PRODUCTS: readonly NaiuProduct[] = [
  { id: 'maca-negra', name: 'Maca negra', benefit: 'Rendimiento y enfoque', price: '$75.000', url: 'https://naiu.bio/tienda/naiu-vital/maca-negra' },
  { id: 'maca-roja', name: 'Maca roja', benefit: 'Vitalidad', price: '$75.000', url: 'https://naiu.bio/tienda/naiu-vital/maca-roja' },
  { id: 'camu-camu', name: 'Camu camu', benefit: 'Recuperación', price: '$75.000', url: 'https://naiu.bio/tienda/naiu-vital/camu-camu' },
  { id: 'chontaduro', name: 'Chontaduro', benefit: 'Energía', price: '$35.000', url: 'https://naiu.bio/tienda/naiu-vital/chontaduro' },
  { id: 'cafe-seynekun', name: 'Café Seynekun', benefit: 'Por la mañana', price: '$55.000', url: 'https://naiu.bio/tienda/naiu-vital/cafe-seynekun' },
  { id: 'cacao-seynekun', name: 'Cacao Seynekun', price: '$20.000', url: 'https://naiu.bio/tienda/naiu-vital/cacao-seynekun' },
  { id: 'melena-de-leon', name: 'Melena de león', url: 'https://naiu.bio/tienda/naiu-fungi/melena-de-leon' },
]
