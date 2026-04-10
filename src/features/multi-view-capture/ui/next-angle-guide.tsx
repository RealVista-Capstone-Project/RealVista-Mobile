import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { PITCH_STEP, YAW_SLOTS, YAW_STEP } from '@/entities/capture'

type NextAngleGuideProps = {
  capturedSlots: Set<string>
  currentYaw: number
  currentPitch: number
}

const PITCH_VALUES = [0]

function getAngularDistance(yaw1: number, pitch1: number, yaw2: number, pitch2: number): number {
  let deltaYaw = Math.abs(yaw1 - yaw2)
  if (deltaYaw > 180) deltaYaw = 360 - deltaYaw
  const deltaPitch = Math.abs(pitch1 - pitch2)
  return Math.sqrt(deltaYaw * deltaYaw + deltaPitch * deltaPitch)
}

export const NextAngleGuide = React.memo(function NextAngleGuide({
  capturedSlots,
  currentYaw,
  currentPitch,
}: NextAngleGuideProps) {
  const guide = useMemo(() => {
    let nearestSlot: { key: string; yaw: number; pitch: number } | null = null
    let minDistance = Infinity

    for (let yi = 0; yi < YAW_SLOTS; yi++) {
      for (let pi = 0; pi < PITCH_VALUES.length; pi++) {
        const key = `${yi}-${pi}`
        if (capturedSlots.has(key)) continue

        const slotYaw = yi * YAW_STEP
        const slotPitch = PITCH_VALUES[pi]
        const dist = getAngularDistance(currentYaw, currentPitch, slotYaw, slotPitch)

        if (dist < minDistance) {
          minDistance = dist
          nearestSlot = { key, yaw: slotYaw, pitch: slotPitch }
        }
      }
    }

    if (!nearestSlot) return null

    // Determine direction
    let deltaYaw = nearestSlot.yaw - currentYaw
    // Normalize to [-180, 180]
    if (deltaYaw > 180) deltaYaw -= 360
    if (deltaYaw < -180) deltaYaw += 360
    const deltaPitch = nearestSlot.pitch - currentPitch

    const parts: string[] = []
    let arrow = ''

    const yawThreshold = YAW_STEP / 3 // ~15° dead zone
    const pitchThreshold = PITCH_STEP / 3 // ~15° dead zone

    if (Math.abs(deltaPitch) > pitchThreshold) {
      if (deltaPitch > 0) {
        parts.push('Ngẩng lên')
        arrow = '↑'
      } else {
        parts.push('Cúi xuống')
        arrow = '↓'
      }
    }

    if (Math.abs(deltaYaw) > yawThreshold) {
      if (deltaYaw > 0) {
        parts.push('Quay phải')
        arrow = parts.length > 1 ? '↗' : '→'
      } else {
        parts.push('Quay trái')
        arrow = parts.length > 1 ? '↖' : '←'
      }
    }

    // Fix combined arrows
    if (parts.includes('Cúi xuống') && parts.includes('Quay phải')) arrow = '↘'
    if (parts.includes('Cúi xuống') && parts.includes('Quay trái')) arrow = '↙'

    if (parts.length === 0) return null // Already at nearest slot

    return { arrow, text: parts.join(' & '), distance: Math.round(minDistance) }
  }, [capturedSlots, currentYaw, currentPitch])

  if (!guide) {
    return (
      <View style={styles.container}>
        <Text style={styles.completeText}>✓ Đã bao phủ tất cả góc độ!</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.arrow}>{guide.arrow}</Text>
      <Text style={styles.text}>{guide.text}</Text>
      <Text style={styles.distance}>~{guide.distance}°</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#F59E0B',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  distance: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  completeText: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
