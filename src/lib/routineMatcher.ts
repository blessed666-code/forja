import { ROUTINE_CLUSTERS, TIME_MODULATIONS, resolveClusterId, resolveTimeMode } from '@/data/clusters'
import type { Gender, Goal, JointAlert, Level, Profile, RoutineClusterId, TimeMode } from '@/data/types'
import { selectNaiuSuperfood } from './nutritionEngine'

export interface QuizInput {
  name: string
  gender: Gender
  goal: Goal
  daysPerWeek: 3 | 4 | 5
  sessionMinutes: 60 | 90 | 120
  level: Level
  jointAlerts?: JointAlert[]
  age?: number
  weightKg?: number
  heightCm?: number
  energyLevel?: 'bajo' | 'normal' | 'alto'
}

export function matchRoutineCluster(quiz: QuizInput): {
  profile: Profile
  clusterId: RoutineClusterId
  timeMode: TimeMode
  clusterName: string
} {
  const clusterId = resolveClusterId(quiz.gender, quiz.daysPerWeek)
  const timeMode = resolveTimeMode(quiz.sessionMinutes)
  const clusterDef = ROUTINE_CLUSTERS[clusterId]
  const naiu = selectNaiuSuperfood(quiz.gender, quiz.goal, quiz.energyLevel)

  const profile: Profile = {
    name: quiz.name.trim(),
    gender: quiz.gender,
    goal: quiz.goal,
    days: quiz.daysPerWeek as Profile['days'],
    minutes: quiz.sessionMinutes as Profile['minutes'],
    session_duration_min: quiz.sessionMinutes,
    place: 'gym',
    level: quiz.level,
    care: (quiz.jointAlerts?.[0] as Profile['care']) ?? 'ninguna',
    joint_alerts: quiz.jointAlerts ?? [],
    cluster_id: clusterId,
    time_mode: timeMode,
    age: quiz.age ?? 25,
    weight_kg: quiz.weightKg ?? 70,
    height_cm: quiz.heightCm ?? 175,
    energy_level: quiz.energyLevel ?? 'normal',
    naiu_stack: [naiu.product_slug],
  }

  return {
    profile,
    clusterId,
    timeMode,
    clusterName: clusterDef ? clusterDef.name : `Cluster ${clusterId}`,
  }
}
