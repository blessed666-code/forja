import type { Metadata } from 'next'
import { QuizFlow } from '@/components/sections/QuizFlow'

export const metadata: Metadata = {
  title: 'Quiz',
}

export default function QuizPage() {
  return <QuizFlow />
}
