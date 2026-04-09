import { Canvas, useFrame } from '@react-three/fiber/native'
import React, { useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import * as THREE from 'three'

import { YAW_SLOTS, YAW_STEP } from '@/entities/capture'

type Sphere3DCoverageProps = {
  capturedSlots: Set<string>
  currentYaw: number
  currentPitch: number
  currentSlot: string
}

const PITCH_VALUES = [0]

// Memoised — only re-renders when isCaptured/isCurrent actually change
const SlotDot = React.memo(function SlotDot({
  position,
  isCaptured,
  isCurrent,
}: {
  position: [number, number, number]
  isCaptured: boolean
  isCurrent: boolean
}) {
  const color = useMemo(() => {
    if (isCurrent) return isCaptured ? '#059669' : '#3B82F6'
    if (isCaptured) return '#10B981'
    return '#6B7280'
  }, [isCaptured, isCurrent])

  return (
    <mesh position={position} scale={isCurrent ? 1.4 : 1}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isCurrent ? 0.8 : isCaptured ? 0.4 : 0.1}
      />
      {isCurrent && (
        <mesh>
          <ringGeometry args={[0.1, 0.12, 32]} />
          <meshBasicMaterial color='#FFFFFF' side={THREE.DoubleSide} />
        </mesh>
      )}
    </mesh>
  )
})

function CoverageGlobe({
  capturedSlots,
  currentYaw,
  currentSlot,
}: Omit<Sphere3DCoverageProps, 'currentPitch'>) {
  const groupRef = useRef<THREE.Group>(null)

  // Sync currentYaw into a ref every render so useFrame always sees the
  // latest value WITHOUT being re-registered as a new callback each tick.
  const yawRef = useRef(currentYaw)
  yawRef.current = currentYaw

  useFrame(() => {
    if (!groupRef.current) return

    const targetY = -(yawRef.current * Math.PI) / 180

    // Shortest-path delta — eliminates the 0°/360° wrap-around wobble
    let delta = targetY - groupRef.current.rotation.y
    while (delta > Math.PI) delta -= 2 * Math.PI
    while (delta < -Math.PI) delta += 2 * Math.PI

    groupRef.current.rotation.y += delta * 0.12
    // Fixed downward tilt so equator dots are always visible
    groupRef.current.rotation.x = 0.15
  })

  const slots = useMemo(() => {
    const result: { key: string; position: [number, number, number] }[] = []
    for (let yi = 0; yi < YAW_SLOTS; yi++) {
      for (let pi = 0; pi < PITCH_VALUES.length; pi++) {
        const yawRad = (yi * YAW_STEP * Math.PI) / 180
        const pitchRad = (PITCH_VALUES[pi] * Math.PI) / 180
        result.push({
          key: `${yi}-${pi}`,
          position: [
            Math.cos(pitchRad) * Math.sin(yawRad),
            Math.sin(pitchRad),
            Math.cos(pitchRad) * Math.cos(yawRad),
          ],
        })
      }
    }
    return result
  }, [])

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.98, 24, 24]} />
        <meshBasicMaterial color='#1F2937' wireframe transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.005, 8, 64]} />
        <meshBasicMaterial color='#4B5563' transparent opacity={0.3} />
      </mesh>
      {slots.map((slot) => (
        <SlotDot
          key={slot.key}
          position={slot.position}
          isCaptured={capturedSlots.has(slot.key)}
          isCurrent={slot.key === currentSlot}
        />
      ))}
    </group>
  )
}

export const Sphere3DCoverage = React.memo(function Sphere3DCoverage(props: Sphere3DCoverageProps) {
  return (
    <View style={styles.container}>
      <Canvas
        style={styles.canvas}
        camera={{ position: [0, 0.3, 2.5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} />
        <CoverageGlobe
          capturedSlots={props.capturedSlots}
          currentYaw={props.currentYaw}
          currentSlot={props.currentSlot}
        />
      </Canvas>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 180,
    width: 180,
  },
  canvas: {
    width: 180,
    height: 180,
  },
})
