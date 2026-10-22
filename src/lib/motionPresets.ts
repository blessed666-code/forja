import type { Variants } from 'framer-motion'

export const FITNESS_SPRING = { type: 'spring' as const, stiffness: 400, damping: 25 }

export const enterContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

export const enterItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: FITNESS_SPRING,
  },
}
