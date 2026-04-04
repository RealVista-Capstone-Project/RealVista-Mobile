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

const PITCH_VALUES = [0] // matches current 6-slot test config

function SlotDot({
  position,
  isCaptured,
  isCurrent,
}: {
  position: [number, number, number]
  isCaptured: boolean
  isCurrent: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const scale = isCurrent ? 1.4 : 1

  const color = useMemo(() => {
    if (isCurrent) return isCaptured ? '#059669' : '#3B82F6'
    if (isCaptured) return '#10B981'
    return '#6B7280'
  }, [isCaptured, isCurrent])

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
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
}

function CoverageGlobe({
  capturedSlots,
  currentYaw,
  currentPitch,
  currentSlot,
}: Sphere3DCoverageProps) {
  const groupRef = useRef<THREE.Group>(null)
  const targetRotation = useRef({ x: 0, y: 0 })

  // Smoothly rotate the globe to match camera orientation
  useFrame(() => {
    if (!groupRef.current) return

    // Target: rotate globe so the "current view" faces the camera
    targetRotation.current = {
      x: -(currentPitch * Math.PI) / 180,
      y: -(currentYaw * Math.PI) / 180,
    }

    // Lerp for smooth rotation
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.1
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.1
  })

  // Generate slot positions on unit sphere
  const slots = useMemo(() => {
    const result: {
      key: string
      position: [number, number, number]
    }[] = []

    for (let yi = 0; yi < YAW_SLOTS; yi++) {
      for (let pi = 0; pi < PITCH_VALUES.length; pi++) {
        const yawRad = (yi * YAW_STEP * Math.PI) / 180
        const pitchRad = (PITCH_VALUES[pi] * Math.PI) / 180

        // Spherical to cartesian
        const x = Math.cos(pitchRad) * Math.sin(yawRad)
        const y = Math.sin(pitchRad)
        const z = Math.cos(pitchRad) * Math.cos(yawRad)

        result.push({
          key: `${yi}-${pi}`,
          position: [x, y, z],
        })
      }
    }

    return result
  }, [])

  return (
    <group ref={groupRef}>
      {/* Wireframe sphere shell */}
      <mesh>
        <sphereGeometry args={[0.98, 24, 24]} />
        <meshBasicMaterial color='#1F2937' wireframe transparent opacity={0.15} />
      </mesh>

      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.005, 8, 64]} />
        <meshBasicMaterial color='#4B5563' transparent opacity={0.3} />
      </mesh>

      {/* Slot dots */}
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
        <CoverageGlobe {...props} />
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
