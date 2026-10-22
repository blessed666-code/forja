'use client'

import Image from 'next/image'
import { exerciseGifUrl } from '@/data/exerciseMedia'

interface ExercisePhotoProps {
  exerciseId: string
  name: string
  priority?: boolean
}

export function ExercisePhoto({ exerciseId, name, priority = false }: ExercisePhotoProps) {
  const source = exerciseGifUrl(exerciseId)
  if (!source) return null

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface motion-reduce:opacity-90">
        <Image
          src={source}
          alt={`Demostración animada del movimiento: ${name}.`}
          fill
          unoptimized
          sizes="(max-width: 512px) 100vw, 512px"
          className="object-cover object-top motion-reduce:contrast-125"
          priority={priority}
        />
      </div>
      <figcaption className="text-sm text-muted">
        GIF de{' '}
        <a
          href="https://github.com/JahelCuadrado/ExerciseGymGifsDB"
          className="underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          ExerciseGymGifsDB
        </a>
        , servido por jsDelivr.
      </figcaption>
    </figure>
  )
}
