import { useCallback, useEffect, useRef, useState } from 'react'

import { type CapturedImage, useCaptureStore, YAW_SLOTS, YAW_STEP } from '@/entities/capture'
import {
  type ViroCameraTransform,
  type ViroTrackingState,
  type ViroTrackingReason,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro'

// ─── Configuration ────────────────────────────────────────────────────────────
const ANCHOR_DISTANCE = 3 // metres from origin
const DWELL_THRESHOLD_DEG = 8 // camera must aim within 8° of anchor
const DWELL_DURATION_MS = 1000 // hold for 1 second to capture
const COOLDOWN_MS = 600 // minimum gap between captures
const WARM_UP_MS = 1500 // ignore tracking for first 1.5s

export type GuidanceStatus = 'hold_steady' | 'ready' | 'move_to_new_angle' | 'capturing'

const STATUS_MESSAGES: Record<GuidanceStatus, string> = {
  hold_steady: 'Hold steady',
  ready: 'Ready to capture',
  move_to_new_angle: 'Move to a new angle',
  capturing: 'Capturing...',
}

// ─── Anchor positions ─────────────────────────────────────────────────────────
// 8 anchors arranged in a circle at eye-level (y=0), 3m radius
// ViroReact coordinate system: x = right, y = up, z = backwards (toward camera)
// So a point "in front" is [0, 0, -3] and we rotate around y-axis
const ANCHOR_POSITIONS: [number, number, number][] = Array.from({ length: YAW_SLOTS }, (_, i) => {
  const angleDeg = i * YAW_STEP
  const angleRad = (angleDeg * Math.PI) / 180
  return [ANCHOR_DISTANCE * Math.sin(angleRad), 0, -ANCHOR_DISTANCE * Math.cos(angleRad)] as [
    number,
    number,
    number,
  ]
})

export { ANCHOR_POSITIONS, ANCHOR_DISTANCE }

// ─── Types ────────────────────────────────────────────────────────────────────
type TakeScreenshotFn = (
  fileName: string,
  saveToCameraRoll: boolean
) => Promise<{ success: boolean; url: string; errorCode: number }>

export type ARDwellResult = {
  yaw: number
  pitch: number
  currentSlot: string
  status: GuidanceStatus
  message: string
  dwellProgress: number // 0..1
  isTracking: boolean
  hideAnchors: boolean
  isSlotCaptured: boolean
  canCapture: boolean

  // Callbacks to wire into ViroARScene
  onCameraTransformUpdate: (transform: ViroCameraTransform) => void
  onTrackingUpdated: (state: ViroTrackingState, reason: ViroTrackingReason) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function vec3Dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function vec3Length(v: number[]): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
}

function vec3Normalize(v: number[]): number[] {
  const len = vec3Length(v)
  if (len < 1e-8) return [0, 0, -1]
  return [v[0] / len, v[1] / len, v[2] / len]
}

function angleBetweenDeg(a: number[], b: number[]): number {
  const dot = vec3Dot(vec3Normalize(a), vec3Normalize(b))
  const clamped = Math.max(-1, Math.min(1, dot))
  return Math.acos(clamped) * (180 / Math.PI)
}

/** Convert forward vector to a 0–360 yaw (azimuth from -Z axis, clockwise) */
function forwardToYaw(forward: number[]): number {
  // forward = [fx, fy, fz], we care about the XZ projection
  const yawRad = Math.atan2(forward[0], -forward[2])
  return ((yawRad * 180) / Math.PI + 360) % 360
}

/** Convert forward vector to pitch in degrees */
function forwardToPitch(forward: number[]): number {
  const xz = Math.sqrt(forward[0] * forward[0] + forward[2] * forward[2])
  return Math.atan2(forward[1], xz) * (180 / Math.PI)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useARDwell(takeScreenshot: TakeScreenshotFn | null): ARDwellResult {
  const capturedSlots = useCaptureStore((s) => s.capturedSlots)
  const markCaptured = useCaptureStore((s) => s.markCaptured)

  const [yaw, setYaw] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [status, setStatus] = useState<GuidanceStatus>('hold_steady')
  const [dwellProgress, setDwellProgress] = useState(0)
  const [hideAnchors, setHideAnchors] = useState(false)
  const [currentSlot, setCurrentSlot] = useState('0-0')

  const isWarmRef = useRef(false)
  const dwellStartRef = useRef<number | null>(null)
  const dwellSlotRef = useRef<string | null>(null)
  const cooldownRef = useRef(false)
  const isCapturingRef = useRef(false)
  const dwellTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const capturedSlotsRef = useRef(capturedSlots)

  // Keep ref in sync
  useEffect(() => {
    capturedSlotsRef.current = capturedSlots
  }, [capturedSlots])

  // Warm-up delay
  useEffect(() => {
    const timer = setTimeout(() => {
      isWarmRef.current = true
    }, WARM_UP_MS)
    return () => clearTimeout(timer)
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) clearInterval(dwellTimerRef.current)
    }
  }, [])

  const doCapture = useCallback(
    async (slot: string, capturedYaw: number, capturedPitch: number) => {
      if (!takeScreenshot || isCapturingRef.current || cooldownRef.current) return

      isCapturingRef.current = true
      setStatus('capturing')
      setHideAnchors(true)

      // Wait for the Viro native scene to update (hide anchors) before screenshot
      await new Promise((r) => setTimeout(r, 200))

      try {
        const fileName = `capture_${slot}_${Date.now()}`
        const result = await takeScreenshot(fileName, false)

        if (result.success && result.url) {
          const image: CapturedImage = {
            path: result.url,
            yaw: capturedYaw,
            pitch: capturedPitch,
            slot,
            timestamp: Date.now(),
          }
          markCaptured(slot, image)
          console.log(`[AR Capture] Captured slot: ${slot}`)
        } else {
          console.warn('[AR Capture] Screenshot failed:', result.errorCode)
        }
      } catch (error) {
        console.warn('[AR Capture] takeScreenshot error:', error)
      } finally {
        isCapturingRef.current = false
        setHideAnchors(false)
        cooldownRef.current = true
        setTimeout(() => {
          cooldownRef.current = false
        }, COOLDOWN_MS)
      }
    },
    [takeScreenshot, markCaptured]
  )

  const onCameraTransformUpdate = useCallback(
    (transform: ViroCameraTransform) => {
      if (!isWarmRef.current || isCapturingRef.current) return

      const fwd = transform.forward as number[]
      const newYaw = forwardToYaw(fwd)
      const newPitch = forwardToPitch(fwd)

      setYaw(newYaw)
      setPitch(newPitch)

      // Find the closest anchor
      let closestSlot = '0-0'
      let closestAngle = Infinity

      for (let i = 0; i < YAW_SLOTS; i++) {
        const anchor = ANCHOR_POSITIONS[i]
        // Direction from origin to anchor (camera is at origin in world space)
        const toAnchor = [anchor[0], anchor[1], anchor[2]]
        const angle = angleBetweenDeg(fwd, toAnchor)
        if (angle < closestAngle) {
          closestAngle = angle
          closestSlot = `${i}-0`
        }
      }

      setCurrentSlot(closestSlot)

      const isCaptured = capturedSlotsRef.current.has(closestSlot)
      const isAimed = closestAngle < DWELL_THRESHOLD_DEG

      // Determine status
      if (!isAimed) {
        // Not aimed at any anchor
        setStatus('hold_steady')
        setDwellProgress(0)
        dwellStartRef.current = null
        dwellSlotRef.current = null
        if (dwellTimerRef.current) {
          clearInterval(dwellTimerRef.current)
          dwellTimerRef.current = null
        }
        return
      }

      if (isCaptured) {
        setStatus('move_to_new_angle')
        setDwellProgress(0)
        dwellStartRef.current = null
        dwellSlotRef.current = null
        if (dwellTimerRef.current) {
          clearInterval(dwellTimerRef.current)
          dwellTimerRef.current = null
        }
        return
      }

      // Aimed at uncaptured anchor
      if (dwellSlotRef.current !== closestSlot) {
        // Started aiming at a new slot
        dwellStartRef.current = Date.now()
        dwellSlotRef.current = closestSlot
        setDwellProgress(0)
        setStatus('ready')

        // Start progress update interval
        if (dwellTimerRef.current) clearInterval(dwellTimerRef.current)
        dwellTimerRef.current = setInterval(() => {
          if (!dwellStartRef.current || isCapturingRef.current) return
          const elapsed = Date.now() - dwellStartRef.current
          const progress = Math.min(1, elapsed / DWELL_DURATION_MS)
          setDwellProgress(progress)

          if (progress >= 1) {
            if (dwellTimerRef.current) {
              clearInterval(dwellTimerRef.current)
              dwellTimerRef.current = null
            }
            // Trigger capture
            const slot = dwellSlotRef.current
            if (slot && !capturedSlotsRef.current.has(slot)) {
              doCapture(slot, newYaw, newPitch)
            }
            dwellStartRef.current = null
            dwellSlotRef.current = null
            setDwellProgress(0)
          }
        }, 50)
      }
      // If same slot, the interval handles progress updates
      setStatus('ready')
    },
    [doCapture]
  )

  const onTrackingUpdated = useCallback((state: ViroTrackingState, _reason: ViroTrackingReason) => {
    const tracking =
      state === ViroTrackingStateConstants.TRACKING_NORMAL ||
      state === ViroTrackingStateConstants.TRACKING_LIMITED
    setIsTracking(tracking)

    if (!tracking) {
      setStatus('hold_steady')
      setDwellProgress(0)
      dwellStartRef.current = null
      dwellSlotRef.current = null
      if (dwellTimerRef.current) {
        clearInterval(dwellTimerRef.current)
        dwellTimerRef.current = null
      }
    }
  }, [])

  const isSlotCaptured = capturedSlots.has(currentSlot)

  return {
    yaw,
    pitch,
    currentSlot,
    status,
    message: STATUS_MESSAGES[status],
    dwellProgress,
    isTracking,
    hideAnchors,
    isSlotCaptured,
    canCapture: isTracking && !isSlotCaptured && !isCapturingRef.current,
    onCameraTransformUpdate,
    onTrackingUpdated,
  }
}
