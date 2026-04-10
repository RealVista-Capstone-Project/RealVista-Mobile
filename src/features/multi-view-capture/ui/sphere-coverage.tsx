import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, Ellipse } from 'react-native-svg'

import { YAW_SLOTS, YAW_STEP } from '@/entities/capture'

type SphereCoverageProps = {
  capturedSlots: Set<string>
  currentYaw: number
  currentPitch: number
  currentSlot: string
}

const SIZE = 160
const CENTER = SIZE / 2
const SPHERE_RADIUS = SIZE / 2 - 10
const DOT_RADIUS = 10

const DEG_TO_RAD = Math.PI / 180

// All possible slots with their real-world angles
function getAllSlotAngles() {
  const slots: { key: string; yaw: number; pitch: number }[] = []
  const pitchSlots = [0] // Only center row for 6-slot test

  for (let yi = 0; yi < YAW_SLOTS; yi++) {
    for (let pi = 0; pi < pitchSlots.length; pi++) {
      slots.push({
        key: `${yi}-${pi}`,
        yaw: yi * YAW_STEP,
        pitch: pitchSlots[pi],
      })
    }
  }
  return slots
}

const ALL_SLOTS = getAllSlotAngles()

export const SphereCoverage = React.memo(function SphereCoverage({
  capturedSlots,
  currentYaw,
  currentPitch,
  currentSlot,
}: SphereCoverageProps) {
  const dots = useMemo(() => {
    return ALL_SLOTS.map((slot) => {
      // Relative angles from current camera direction
      let deltaYaw = (slot.yaw - currentYaw) * DEG_TO_RAD
      const deltaPitch = (slot.pitch - currentPitch) * DEG_TO_RAD

      // Normalize deltaYaw to [-PI, PI]
      while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI
      while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI

      // Spherical to cartesian (orthographic projection)
      const x = Math.sin(deltaYaw) * Math.cos(deltaPitch)
      const y = -Math.sin(deltaPitch)
      const z = Math.cos(deltaYaw) * Math.cos(deltaPitch)

      // Only show front hemisphere (z > -0.1 for slight wrap-around)
      if (z < -0.1) return null

      // Map to SVG coordinates — scale by sphere radius
      const svgX = CENTER + x * SPHERE_RADIUS
      const svgY = CENTER + y * SPHERE_RADIUS

      // Depth-based sizing: closer = bigger
      const depthScale = Math.max(0.4, (z + 1) / 2)
      const dotSize = DOT_RADIUS * depthScale

      // Determine color
      const isCaptured = capturedSlots.has(slot.key)
      const isCurrent = slot.key === currentSlot
      let fill = 'rgba(255,255,255,0.2)' // uncaptured
      let opacity = 0.6
      if (isCaptured) {
        fill = '#10B981'
        opacity = 0.9
      }
      if (isCurrent) {
        fill = isCaptured ? '#059669' : '#3B82F6'
        opacity = 1
      }

      return (
        <Circle
          key={slot.key}
          cx={svgX}
          cy={svgY}
          r={dotSize}
          fill={fill}
          opacity={opacity}
          stroke={isCurrent ? '#FFFFFF' : 'transparent'}
          strokeWidth={isCurrent ? 2 : 0}
        />
      )
    }).filter(Boolean)
  }, [capturedSlots, currentYaw, currentPitch, currentSlot])

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Sphere outline */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={SPHERE_RADIUS}
          fill='rgba(0,0,0,0.4)'
          stroke='rgba(255,255,255,0.15)'
          strokeWidth={1}
        />
        {/* Equator line */}
        <Ellipse
          cx={CENTER}
          cy={CENTER}
          rx={SPHERE_RADIUS}
          ry={4}
          fill='transparent'
          stroke='rgba(255,255,255,0.1)'
          strokeWidth={0.5}
        />
        {/* Meridian line */}
        <Ellipse
          cx={CENTER}
          cy={CENTER}
          rx={4}
          ry={SPHERE_RADIUS}
          fill='transparent'
          stroke='rgba(255,255,255,0.1)'
          strokeWidth={0.5}
        />
        {/* Slot dots */}
        {dots}
      </Svg>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
})
