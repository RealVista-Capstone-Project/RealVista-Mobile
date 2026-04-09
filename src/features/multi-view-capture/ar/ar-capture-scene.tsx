import React from 'react'
import {
  ViroARScene,
  ViroNode,
  ViroSphere,
  ViroText,
  ViroMaterials,
  ViroAmbientLight,
  type ViroCameraTransform,
  type ViroTrackingState,
  type ViroTrackingReason,
} from '@reactvision/react-viro'

import { YAW_SLOTS, YAW_STEP } from '@/entities/capture'

import { ANCHOR_DISTANCE, ANCHOR_POSITIONS } from './use-ar-dwell'

// ─── Constants ────────────────────────────────────────────────────────────────
const SPHERE_RADIUS = 0.12 // metres
const CURRENT_SPHERE_RADIUS = 0.15
const CAPTURED_SPHERE_RADIUS = 0.08

const DIRECTION_LABELS: Record<number, string> = {
  0: 'N',
  45: 'NE',
  90: 'E',
  135: 'SE',
  180: 'S',
  225: 'SW',
  270: 'W',
  315: 'NW',
}

// ─── Materials ────────────────────────────────────────────────────────────────
ViroMaterials.createMaterials({
  anchorDefault: {
    diffuseColor: 'rgba(255, 255, 255, 0.6)',
    lightingModel: 'Constant',
  },
  anchorCurrent: {
    diffuseColor: 'rgba(16, 185, 129, 0.85)', // green
    lightingModel: 'Constant',
  },
  anchorReady: {
    diffuseColor: 'rgba(16, 185, 129, 0.95)',
    lightingModel: 'Constant',
  },
  anchorCaptured: {
    diffuseColor: 'rgba(16, 185, 129, 0.3)',
    lightingModel: 'Constant',
  },
  anchorMoveAway: {
    diffuseColor: 'rgba(107, 114, 128, 0.5)', // gray
    lightingModel: 'Constant',
  },
})

// ─── Props ────────────────────────────────────────────────────────────────────
type ARCaptureSceneProps = {
  capturedSlots: Set<string>
  currentSlot: string
  hideAnchors: boolean
  onCameraTransformUpdate: (transform: ViroCameraTransform) => void
  onTrackingUpdated: (state: ViroTrackingState, reason: ViroTrackingReason) => void
}

// ─── Scene Component ──────────────────────────────────────────────────────────
export function ARCaptureScene({
  capturedSlots,
  currentSlot,
  hideAnchors,
  onCameraTransformUpdate,
  onTrackingUpdated,
}: ARCaptureSceneProps) {
  return (
    <ViroARScene
      onCameraTransformUpdate={onCameraTransformUpdate}
      onTrackingUpdated={onTrackingUpdated}
    >
      <ViroAmbientLight color='#FFFFFF' intensity={800} />

      {!hideAnchors &&
        Array.from({ length: YAW_SLOTS }, (_, i) => {
          const slotKey = `${i}-0`
          const isCaptured = capturedSlots.has(slotKey)
          const isCurrent = slotKey === currentSlot
          const position = ANCHOR_POSITIONS[i]
          const label = DIRECTION_LABELS[i * YAW_STEP] ?? `${i * YAW_STEP}°`

          let material = 'anchorDefault'
          let radius = SPHERE_RADIUS
          if (isCaptured) {
            material = 'anchorCaptured'
            radius = CAPTURED_SPHERE_RADIUS
          } else if (isCurrent) {
            material = 'anchorCurrent'
            radius = CURRENT_SPHERE_RADIUS
          }

          return (
            <ViroNode key={slotKey} position={position}>
              <ViroSphere
                radius={radius}
                widthSegmentCount={16}
                heightSegmentCount={16}
                materials={[material]}
              />
              <ViroText
                text={isCaptured ? `✓ ${label}` : label}
                position={[0, radius + 0.08, 0]}
                style={{
                  fontSize: 14,
                  color: isCaptured ? '#10B981' : '#FFFFFF',
                  fontWeight: 'bold',
                  textAlignVertical: 'center',
                  textAlign: 'center',
                }}
                width={0.5}
                height={0.2}
              />
            </ViroNode>
          )
        })}
    </ViroARScene>
  )
}
