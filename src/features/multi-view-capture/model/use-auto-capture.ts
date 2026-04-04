import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera } from 'react-native-vision-camera'

import { type CapturedImage, useCaptureStore } from '@/entities/capture'

import { useCaptureGuidance } from './use-capture-guidance'

const READY_DELAY_MS = 250 // Hold stable for 250ms before capture
const COOLDOWN_MS = 400 // 400ms between captures
const CAMERA_WARM_UP_MS = 2000 // Wait for camera session to stabilize

export function useAutoCapture(cameraRef: React.RefObject<Camera | null>) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const guidance = useCaptureGuidance(isCapturing)
  const markCaptured = useCaptureStore((s) => s.markCaptured)

  // Use refs for current orientation to prevent doCapture from being recreated on every slight movement
  const orientationRef = useRef({
    yaw: guidance.yaw,
    pitch: guidance.pitch,
    slot: guidance.currentSlot,
  })

  useEffect(() => {
    orientationRef.current = {
      yaw: guidance.yaw,
      pitch: guidance.pitch,
      slot: guidance.currentSlot,
    }
  }, [guidance.yaw, guidance.pitch, guidance.currentSlot])

  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownRef = useRef(false)
  const lastCaptureRef = useRef(0)

  // Give the camera session time to stabilize after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCameraReady(true)
    }, CAMERA_WARM_UP_MS)

    return () => clearTimeout(timer)
  }, [])

  const doCapture = useCallback(async () => {
    if (!cameraRef.current || cooldownRef.current || !isCameraReady) return

    const now = Date.now()
    if (now - lastCaptureRef.current < COOLDOWN_MS) return

    try {
      setIsCapturing(true)
      cooldownRef.current = true

      // Use the latest stable orientation from the ref
      const { yaw, pitch, slot } = orientationRef.current

      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: true,
      })

      const image: CapturedImage = {
        path: photo.path,
        yaw,
        pitch,
        slot,
        timestamp: Date.now(),
      }

      markCaptured(slot, image)
      lastCaptureRef.current = Date.now()
      console.log(`[Capture] Successfully captured slot: ${slot}`)
    } catch (error) {
      console.warn('[Capture] takePhoto failed:', error)
      // Don't mark as captured — let user retry at this angle
    } finally {
      setIsCapturing(false)
      setTimeout(() => {
        cooldownRef.current = false
      }, COOLDOWN_MS)
    }
  }, [cameraRef, isCameraReady, markCaptured])

  // Auto-capture trigger: wait 500ms of sustained readiness
  useEffect(() => {
    if (guidance.canCapture && !cooldownRef.current && isCameraReady) {
      // Only start the timer if it's not already running
      if (!readyTimerRef.current) {
        readyTimerRef.current = setTimeout(() => {
          doCapture()
          readyTimerRef.current = null
        }, READY_DELAY_MS)
      }
    } else {
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current)
        readyTimerRef.current = null
      }
    }

    return () => {
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current)
      }
    }
  }, [guidance.canCapture, isCameraReady, doCapture])

  return {
    ...guidance,
    isCapturing,
    isCameraReady,
  }
}
