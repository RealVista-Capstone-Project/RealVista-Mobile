import { useMemo } from 'react'

import { getSlotKey, useCaptureStore } from '@/entities/capture'
import { useDeviceStability } from '@/shared/hooks/use-device-stability'
import { useOrientation } from '@/shared/hooks/use-orientation'

export type GuidanceStatus = 'hold_steady' | 'move_to_new_angle' | 'ready' | 'capturing'

type GuidanceResult = {
  yaw: number
  pitch: number
  currentSlot: string
  isStable: boolean
  canCapture: boolean
  status: GuidanceStatus
  message: string
  isSlotCaptured: boolean
  calibrate: () => void
}

const STATUS_MESSAGES: Record<GuidanceStatus, string> = {
  hold_steady: 'Hold steady',
  move_to_new_angle: 'Move to a new angle',
  ready: 'Ready to capture',
  capturing: 'Capturing...',
}

export function useCaptureGuidance(isCapturing = false): GuidanceResult {
  const { yaw, pitch, resetOrientation } = useOrientation()
  const { isStable } = useDeviceStability()
  const capturedSlots = useCaptureStore((s) => s.capturedSlots)

  const currentSlot = useMemo(() => getSlotKey(yaw, pitch), [yaw, pitch])
  const isSlotCaptured = capturedSlots.has(currentSlot)

  const status: GuidanceStatus = useMemo(() => {
    if (isCapturing) return 'capturing'
    if (!isStable) return 'hold_steady'
    if (isSlotCaptured) return 'move_to_new_angle'
    return 'ready'
  }, [isCapturing, isStable, isSlotCaptured])

  const canCapture = isStable && !isSlotCaptured && !isCapturing

  return {
    yaw,
    pitch,
    currentSlot,
    isStable,
    canCapture,
    status,
    message: STATUS_MESSAGES[status],
    isSlotCaptured,
    calibrate: resetOrientation,
  }
}
