import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors'
import { useCallback, useEffect, useRef, useState } from 'react'

const UPDATE_INTERVAL_MS = 50 // 20Hz
const PITCH_MIN = -45
const PITCH_MAX = 45

type Orientation = {
  yaw: number // 0–360 degrees
  pitch: number // -60 to +60 degrees
}

const normalizeYaw = (angle: number): number => {
  return ((angle % 360) + 360) % 360
}

const clampPitch = (pitch: number): number => {
  return Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitch))
}

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>({ yaw: 0, pitch: 0 })
  const [isAvailable, setIsAvailable] = useState(false)
  const initialAlphaRef = useRef<number | null>(null)

  const handleMotionData = useCallback((data: DeviceMotionMeasurement) => {
    if (!data.rotation) return

    const { alpha } = data.rotation

    // Store the first alpha reading as reference point
    if (initialAlphaRef.current === null) {
      initialAlphaRef.current = alpha
    }

    // Alpha (yaw) is in radians, convert to degrees
    // Offset from initial position so 0° = starting direction
    const rawYaw = ((alpha - initialAlphaRef.current) * 180) / Math.PI
    const yaw = normalizeYaw(rawYaw)

    // Pitch from accelerometer (more reliable than rotation.beta)
    // Uses gravity vector to determine phone tilt:
    //   Vertical (eye level): y dominates → pitch ≈ 0°
    //   Tilt up (screen faces ceiling): z goes negative → pitch > 0
    //   Tilt down (screen faces floor): z goes positive → pitch < 0
    let pitch = 0
    const accel = data.accelerationIncludingGravity
    if (accel) {
      const rawPitch = Math.atan2(-accel.z, -accel.y) * (180 / Math.PI)
      pitch = clampPitch(rawPitch)
    }

    setOrientation({ yaw, pitch })
  }, [])

  const resetOrientation = useCallback(() => {
    initialAlphaRef.current = null
    setOrientation({ yaw: 0, pitch: 0 })
  }, [])

  useEffect(() => {
    let subscription: ReturnType<typeof DeviceMotion.addListener> | null = null

    const setup = async () => {
      const available = await DeviceMotion.isAvailableAsync()
      setIsAvailable(available)

      if (!available) return

      DeviceMotion.setUpdateInterval(UPDATE_INTERVAL_MS)
      subscription = DeviceMotion.addListener(handleMotionData)
    }

    setup()

    return () => {
      subscription?.remove()
    }
  }, [handleMotionData])

  return {
    ...orientation,
    isAvailable,
    resetOrientation,
  }
}
