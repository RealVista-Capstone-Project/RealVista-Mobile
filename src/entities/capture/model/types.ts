export const YAW_STEP = 45
export const PITCH_STEP = 90
export const YAW_SLOTS = 8 // 360 / 45
export const PITCH_SLOTS = 1 // Only center row
export const TOTAL_SLOTS = YAW_SLOTS * PITCH_SLOTS // 8
export const PITCH_OFFSET = 45

export type CaptureSlot = {
  yawIndex: number // 0–11
  pitchIndex: number // 0–4
}

export type CapturedImage = {
  path: string
  yaw: number
  pitch: number
  slot: string // "yawIndex-pitchIndex"
  timestamp: number
}

export type CoverageLevel = 'low' | 'good' | 'excellent'

export const COVERAGE_THRESHOLDS = {
  LOW: 0, // 0–49%
  GOOD: 0.5, // 50–79%
  EXCELLENT: 0.8, // 80%+
} as const

export const MIN_RECOMMENDED_COVERAGE = 0.5 // 50% = 3 images for test

export function getSlotKey(yaw: number, pitch: number): string {
  const yawIndex = Math.floor(yaw / YAW_STEP) % YAW_SLOTS
  const pitchIndex = Math.min(
    PITCH_SLOTS - 1,
    Math.max(0, Math.floor((pitch + PITCH_OFFSET) / PITCH_STEP))
  )
  return `${yawIndex}-${pitchIndex}`
}

export function parseSlotKey(key: string): CaptureSlot {
  const [yawIndex, pitchIndex] = key.split('-').map(Number)
  return { yawIndex, pitchIndex }
}

export function getCoverageLevel(progress: number): CoverageLevel {
  if (progress >= COVERAGE_THRESHOLDS.EXCELLENT) return 'excellent'
  if (progress >= COVERAGE_THRESHOLDS.GOOD) return 'good'
  return 'low'
}
