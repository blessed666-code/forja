import { EXERCISE_GIF_CDN, EXERCISE_MEDIA_SOURCES } from './exerciseMediaManifest'

const GIF_BY_ID = new Map(
  EXERCISE_MEDIA_SOURCES.map((entry) => [
    entry.forjaId,
    `${EXERCISE_GIF_CDN}/${entry.gymGifsDbId}.gif`,
  ]),
)

/** URL del GIF animado en jsDelivr (ExerciseGymGifsDB). */
export function exerciseGifUrl(exerciseId: string): string | null {
  return GIF_BY_ID.get(exerciseId) ?? null
}

/** @deprecated Usar exerciseGifUrl */
export function exercisePhoto(exerciseId: string): string | null {
  return exerciseGifUrl(exerciseId)
}

export function exerciseIdsWithGif(): string[] {
  return EXERCISE_MEDIA_SOURCES.map((entry) => entry.forjaId)
}
