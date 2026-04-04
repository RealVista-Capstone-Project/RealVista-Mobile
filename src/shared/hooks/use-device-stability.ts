import { Gyroscope, type GyroscopeMeasurement } from 'expo-sensors'
import { useCallback, useEffect, useRef, useState } from 'react'

const UPDATE_INTERVAL_MS = 50
const STABILITY_THRESHOLD = 0.15 // rad/s on each axis (relaxed for handheld use)
const STABLE_DEBOUNCE_MS = 150

export function useDeviceStability() {
  const [isStable, setIsStable] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)
  const stableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasStableRef = useRef(false)

  const handleGyroData = useCallback((data: GyroscopeMeasurement) => {
    const currentlyStable =
      Math.abs(data.x) < STABILITY_THRESHOLD &&
      Math.abs(data.y) < STABILITY_THRESHOLD &&
      Math.abs(data.z) < STABILITY_THRESHOLD

    if (currentlyStable && !wasStableRef.current) {
      // Transition to stable: debounce
      stableTimerRef.current = setTimeout(() => {
        setIsStable(true)
        wasStableRef.current = true
      }, STABLE_DEBOUNCE_MS)
    } else if (!currentlyStable && wasStableRef.current) {
      // Transition to unstable: immediate
      if (stableTimerRef.current) {
        clearTimeout(stableTimerRef.current)
        stableTimerRef.current = null
      }
      setIsStable(false)
      wasStableRef.current = false
    }
  }, [])

  useEffect(() => {
    let subscription: ReturnType<typeof Gyroscope.addListener> | null = null

    const setup = async () => {
      const available = await Gyroscope.isAvailableAsync()
      setIsAvailable(available)

      if (!available) return

      Gyroscope.setUpdateInterval(UPDATE_INTERVAL_MS)
      subscription = Gyroscope.addListener(handleGyroData)
    }

    setup()

    return () => {
      subscription?.remove()
      if (stableTimerRef.current) {
        clearTimeout(stableTimerRef.current)
      }
    }
  }, [handleGyroData])

  return { isStable, isAvailable }
}
