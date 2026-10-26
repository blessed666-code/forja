export type NaiuProductSlug =
  | 'maca-negra'
  | 'maca-roja'
  | 'camu-camu'
  | 'chontaduro'
  | 'cafe-seynekun'
  | 'cacao-seynekun'
  | 'cafe-cooagronevada'
  | 'chocolate-mesa-cooagronevada'

export interface NaiuProduct {
  id: NaiuProductSlug
  name: string
  tagline: string
  benefit: string
  dosage: string
  price: string
  url: string
}

export const NAIU_STORE_URL = 'https://naiu.bio/tienda/naiu-vital'
export const NAIU_WHATSAPP_URL = 'https://wa.me/573027910559'
export const NAIU_WHATSAPP_DISPLAY = '+57 302 791 0559'

/**
 * Catálogo oficial 100% verificado de NAIU Vital (naiu.bio).
 * Superalimentos orgánicos, café y cacao de origen indígena (Sierra Nevada de Santa Marta, Pacífico y Andes).
 */
export const NAIU_PRODUCTS: readonly NaiuProduct[] = [
  {
    id: 'maca-negra',
    name: 'Maca Peruana Negra',
    tagline: 'Máximo Rendimiento y Enfoque Mental',
    benefit:
      'Pre-entreno 100% natural para series pesadas, aumento de resistencia física, potencia muscular y concentración mental sin taquicardia.',
    dosage: '5g (1 cucharadita) en agua, café o batido 30 a 45 min antes de entrenar o en el desayuno.',
    price: '$75.000 COP',
    url: 'https://naiu.bio/tienda/naiu-vital/maca-negra',
  },
  {
    id: 'maca-roja',
    name: 'Maca Roja Peruana',
    tagline: 'Tu Fuente de Vitalidad y Equilibrio',
    benefit:
      'Rica en antioxidantes para balance hormonal femenino, densidad ósea, energía sostenida y recuperación tras sesiones intensas de glúteo y pierna.',
    dosage: '5g (1 cucharadita) en la mañana con el desayuno, fruta o batido post-entreno.',
    price: '$75.000 COP',
    url: 'https://naiu.bio/tienda/naiu-vital/maca-roja',
  },
  {
    id: 'camu-camu',
    name: 'Camu Camu',
    tagline: 'El Escudo Natural más Potente del Planeta',
    benefit:
      'Concentración altísima de Vitamina C natural biodisponible: apoya síntesis de colágeno en tendones y articulaciones, modula el cortisol y acelera la recuperación muscular.',
    dosage: '3g a 5g (media a 1 cucharadita) en agua fría o jugo natural después de entrenar o en la mañana.',
    price: '$75.000 COP',
    url: 'https://naiu.bio/tienda/naiu-vital/camu-camu',
  },
  {
    id: 'chontaduro',
    name: 'Chontaduro en Polvo',
    tagline: 'Energía Vital y Protección Celular',
    benefit:
      'Superalimento del Pacífico con aminoácidos esenciales, betacarotenos y energía limpia de liberación sostenida para volumen muscular o días largos.',
    dosage: '1 cucharada (10g) en avena, batido de proteína, leche o fruta antes o después del gimnasio.',
    price: '$35.000 COP',
    url: 'https://naiu.bio/tienda/naiu-vital/chontaduro',
  },
  {
    id: 'cafe-seynekun',
    name: 'Café Indígena de Origen — Seynekun',
    tagline: 'El sabor ancestral de la Sierra Nevada',
    benefit:
      'Café orgánico de altura cultivado por la comunidad Arhuaca en la Sierra Nevada: activación neuromuscular limpia antes de entrenar.',
    dosage: '1 taza filtrada o espresso 30 min antes de entrenar (sin azúcar refinada).',
    price: '$55.000 COP',
    url: 'https://naiu.bio/tienda/naiu-vital/cafe-seynekun',
  },
  {
    id: 'cacao-seynekun',
    name: 'Cacao Indígena de Origen — Seynekun',
    tagline: 'El poder ancestral del cacao desde tierras sagradas',
    benefit:
      'Cacao puro rico en teobromina, magnesio y flavonoides que favorecen el flujo sanguíneo (bombeo muscular), el ánimo y la recuperación.',
    dosage: '1 cucharada en el batido de la mañana o post-entreno junto con Maca Negra o Roja.',
    price: '$20.000 COP',
    url: 'https://naiu.bio/tienda/naiu-vital/cacao-seynekun',
  },
  {
    id: 'cafe-cooagronevada',
    name: 'Café Orgánico Sierra Nevada — Cooagronevada',
    tagline: 'Cosechado por manos indígenas y campesinas',
    benefit:
      'Café 100% orgánico de comercio justo con antioxidantes naturales para enfoque diario y energía sostenida sin químicos.',
    dosage: '1 taza en la mañana o antes de tu sesión de fuerza.',
    price: '$55.000 COP',
    url: 'https://naiu.bio/tienda/naiu-vital/cafe-cooagronevada',
  },
  {
    id: 'chocolate-mesa-cooagronevada',
    name: 'Chocolate de Mesa Gourmet Orgánico',
    tagline: 'El Sabor Ancestral de la Sierra Nevada en tu Taza',
    benefit:
      'Chocolate artesanal orgánico de Cooagronevada para desayunos energéticos pre-entreno o recuperación calórica en etapas de masa muscular.',
    dosage: '1 pastilla/porción preparada en agua o leche en el desayuno de días pesados.',
    price: '$38.000 COP',
    url: 'https://naiu.bio/tienda/naiu-vital/chocolate-mesa-cooagronevada',
  },
]

export function getNaiuProduct(slug: NaiuProductSlug): NaiuProduct {
  return NAIU_PRODUCTS.find((p) => p.id === slug) ?? NAIU_PRODUCTS[0]
}

export const NAIU_AI_CATALOG_CONTEXT = `CATÁLOGO OFICIAL VERIFICADO DE NAIU VITAL (https://naiu.bio/tienda/naiu-vital — Envíos a toda Colombia, pedidos web o WhatsApp ${NAIU_WHATSAPP_DISPLAY}):
1. Maca Peruana Negra ($75.000 COP) — URL: https://naiu.bio/tienda/naiu-vital/maca-negra
   Uso deportivo: Pre-entreno natural estrella para fuerza pesada, hipertrofia, resistencia física y enfoque mental sin taquicardia (5g / 1 cdita 30-45 min antes de entrenar o en la mañana).
2. Maca Roja Peruana ($75.000 COP) — URL: https://naiu.bio/tienda/naiu-vital/maca-roja
   Uso deportivo: Ideal para mujeres (glúteo/tonificación), balance hormonal, densidad ósea, antioxidante y vitalidad sostenida (5g / 1 cdita en el desayuno o post-entreno).
3. Camu Camu ($75.000 COP) — URL: https://naiu.bio/tienda/naiu-vital/camu-camu
   Uso deportivo: Altísima Vitamina C natural; clave para fatiga, estrés/cortisol alto, defensas y síntesis de colágeno para proteger tendones, hombros, codos y rodillas (3-5g en agua o jugo frío).
4. Chontaduro en Polvo ($35.000 COP) — URL: https://naiu.bio/tienda/naiu-vital/chontaduro
   Uso deportivo: Energía vital sostenida del Pacífico, aminoácidos esenciales y betacarotenos; excelente en avena o batidos de desayuno y volumen limpio (1 cucharada / 10g).
5. Café Indígena de Origen Seynekun ($55.000 COP) — URL: https://naiu.bio/tienda/naiu-vital/cafe-seynekun
   Uso deportivo: Café orgánico Arhuaco de la Sierra Nevada para activación matutina o pre-entreno natural 30 min antes del gym.
6. Cacao Indígena de Origen Seynekun ($20.000 COP) — URL: https://naiu.bio/tienda/naiu-vital/cacao-seynekun
   Uso deportivo: Cacao puro con teobromina y magnesio para vasodilatación (mejor bombeo muscular), ánimo y mezcla perfecta con Maca en batidos.
7. Café Orgánico Sierra Nevada Cooagronevada ($55.000 COP) — URL: https://naiu.bio/tienda/naiu-vital/cafe-cooagronevada
   Uso deportivo: Café orgánico de comercio justo para energía limpia diaria y antioxidantes.
8. Chocolate de Mesa Gourmet Orgánico Cooagronevada ($38.000 COP) — URL: https://naiu.bio/tienda/naiu-vital/chocolate-mesa-cooagronevada
   Uso deportivo: Energía ancestral para desayunos pre-entreno o etapas de ganancia de masa muscular.
IMPORTANTE: NAIU NO vende "Maca Amarilla", "Melena de León", creatina sintética ni whey industrial. Nunca inventes productos fuera de estos 8 oficiales.`
