/**
 * ARTargetsOverlay
 *
 * Projects all 8 capture targets (fixed at 0°, 45°, 90°… 315°) onto the live
 * camera viewfinder. Targets feel "anchored in space" — the user rotates to
 * reach them rather than waiting for guidance to follow.
 *
 * Layout:
 *   • On-screen targets  → reticle ring at projected (x, y)
 *   • Off-screen targets → edge arrow at left/right edge (uncaptured only)
 *   • Current target     → pulsing ring coloured by capture readiness
 *   • Captured targets   → small green ✓ badge
 */
import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native'

import { type GuidanceStatus } from '../model/use-capture-guidance'

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window')

/**
 * Horizontal FOV assumption for a typical phone camera in portrait mode.
 * 65° is a reasonable middle-ground (wide-angle ≈ 75°, telephoto ≈ 55°).
 * Adjust if needed; the AR feel improves the closer this matches the real lens.
 */
const H_FOV_DEG = 65
const PIXELS_PER_DEG = SW / H_FOV_DEG

const RETICLE_SIZE = 88 // diameter of the full ring
const RETICLE_HALF = RETICLE_SIZE / 2
const CAPTURED_SIZE = 40
const EDGE_MARGIN = 18 // px from screen edge for off-screen arrows
const TARGET_Y_FRAC = 0.42 // how far down the screen the reticle row sits (0 = top, 1 = bottom)
const TARGET_Y = SH * TARGET_Y_FRAC

const YAW_STEP = 45
const YAW_SLOTS = 8

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

const STATUS_COLORS: Record<GuidanceStatus, string> = {
  hold_steady: '#EF4444',
  move_to_new_angle: '#6B7280',
  ready: '#10B981',
  capturing: '#06B6D4',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalise180(deg: number): number {
  let d = deg % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

// ─── Pulse animation hook ────────────────────────────────────────────────────
function usePulse(active: boolean) {
  const scale = useRef(new Animated.Value(1)).current
  const loop = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    if (active) {
      loop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.18,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
      loop.current.start()
    } else {
      loop.current?.stop()
      scale.setValue(1)
    }
    return () => {
      loop.current?.stop()
    }
  }, [active, scale])

  return scale
}

// ─── Single reticle ─────────────────────────────────────────────────────────
interface ReticleProps {
  screenX: number
  isCurrent: boolean
  isCaptured: boolean
  label: string
  status: GuidanceStatus
}

const Reticle = React.memo(function Reticle({
  screenX,
  isCurrent,
  isCaptured,
  label,
  status,
}: ReticleProps) {
  const shouldPulse = isCurrent && !isCaptured && status === 'ready'
  const scale = usePulse(shouldPulse)

  const ringColor = isCurrent ? STATUS_COLORS[status] : 'rgba(255,255,255,0.45)'
  const ringWidth = isCurrent ? 2.5 : 1.5

  if (isCaptured) {
    // Small captured badge
    return (
      <View
        style={[
          styles.capturedBadge,
          { left: screenX - CAPTURED_SIZE / 2, top: TARGET_Y - CAPTURED_SIZE / 2 },
        ]}
      >
        <Text style={styles.capturedCheck}>✓</Text>
        <Text style={styles.capturedLabel}>{label}</Text>
      </View>
    )
  }

  return (
    <Animated.View
      style={[
        styles.reticleWrapper,
        {
          left: screenX - RETICLE_HALF,
          top: TARGET_Y - RETICLE_HALF,
          transform: [{ scale }],
        },
      ]}
    >
      {/* Outer ring */}
      <View style={[styles.reticleRing, { borderColor: ringColor, borderWidth: ringWidth }]} />

      {/* Centre dot */}
      <View style={[styles.reticleDot, { backgroundColor: ringColor }]} />

      {/* Corner tick marks (top-left, top-right, bottom-left, bottom-right) */}
      <View style={[styles.tick, styles.tickTL, { borderColor: ringColor }]} />
      <View style={[styles.tick, styles.tickTR, { borderColor: ringColor }]} />
      <View style={[styles.tick, styles.tickBL, { borderColor: ringColor }]} />
      <View style={[styles.tick, styles.tickBR, { borderColor: ringColor }]} />

      {/* Label below ring */}
      <Text style={[styles.reticleLabel, isCurrent && { color: ringColor, fontWeight: '800' }]}>
        {label}
      </Text>
    </Animated.View>
  )
})

// ─── Edge arrow for off-screen uncaptured targets ────────────────────────────
interface EdgeArrowProps {
  side: 'left' | 'right'
  label: string
  degAway: number
}

const EdgeArrow = React.memo(function EdgeArrow({ side, label, degAway }: EdgeArrowProps) {
  const left = side === 'left' ? EDGE_MARGIN : SW - EDGE_MARGIN - 32
  return (
    <View style={[styles.edgeArrow, { left, top: TARGET_Y - 20 }]}>
      <Text style={styles.edgeChevron}>{side === 'left' ? '‹' : '›'}</Text>
      <Text style={styles.edgeLabel}>{label}</Text>
      <Text style={styles.edgeDeg}>{Math.round(degAway)}°</Text>
    </View>
  )
})

// ─── Main overlay ─────────────────────────────────────────────────────────────
export type ARTargetsOverlayProps = {
  capturedSlots: Set<string>
  currentYaw: number
  currentSlot: string
  status: GuidanceStatus
}

export const ARTargetsOverlay = React.memo(function ARTargetsOverlay({
  capturedSlots,
  currentYaw,
  currentSlot,
  status,
}: ARTargetsOverlayProps) {
  const reticles: React.ReactNode[] = []
  const edgeArrows: React.ReactNode[] = []

  // Track which edges already have an arrow (show only the nearest per side)
  let leftNearest: { deg: number; label: string } | null = null
  let rightNearest: { deg: number; label: string } | null = null

  for (let yi = 0; yi < YAW_SLOTS; yi++) {
    const targetYaw = yi * YAW_STEP
    const slotKey = `${yi}-0`
    const isCaptured = capturedSlots.has(slotKey)
    const isCurrent = slotKey === currentSlot
    const label = DIRECTION_LABELS[targetYaw] ?? `${targetYaw}°`

    const deltaYaw = normalise180(targetYaw - currentYaw)
    const screenX = SW / 2 + deltaYaw * PIXELS_PER_DEG

    const isOnScreen = screenX >= -RETICLE_HALF && screenX <= SW + RETICLE_HALF

    if (isOnScreen) {
      reticles.push(
        <Reticle
          key={slotKey}
          screenX={screenX}
          isCurrent={isCurrent}
          isCaptured={isCaptured}
          label={label}
          status={status}
        />
      )
    } else if (!isCaptured) {
      // Accumulate nearest off-screen per side
      const absDeg = Math.abs(deltaYaw)
      if (deltaYaw < 0) {
        if (!leftNearest || absDeg < Math.abs(leftNearest.deg)) {
          leftNearest = { deg: deltaYaw, label }
        }
      } else {
        if (!rightNearest || absDeg < Math.abs(rightNearest.deg)) {
          rightNearest = { deg: deltaYaw, label }
        }
      }
    }
  }

  if (leftNearest) {
    edgeArrows.push(
      <EdgeArrow
        key='left'
        side='left'
        label={leftNearest.label}
        degAway={Math.abs(leftNearest.deg)}
      />
    )
  }
  if (rightNearest) {
    edgeArrows.push(
      <EdgeArrow
        key='right'
        side='right'
        label={rightNearest.label}
        degAway={Math.abs(rightNearest.deg)}
      />
    )
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents='none'>
      {reticles}
      {edgeArrows}
    </View>
  )
})

// ─── Styles ───────────────────────────────────────────────────────────────────
const TICK_LEN = 12
const TICK_W = 2

const styles = StyleSheet.create({
  // Reticle
  reticleWrapper: {
    position: 'absolute',
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleRing: {
    position: 'absolute',
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    borderRadius: RETICLE_HALF,
  },
  reticleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reticleLabel: {
    position: 'absolute',
    top: RETICLE_SIZE + 6,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    width: 48,
    marginLeft: -24 + RETICLE_HALF,
  },

  // Corner ticks (camera viewfinder aesthetic)
  tick: {
    position: 'absolute',
    width: TICK_LEN,
    height: TICK_LEN,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  tickTL: {
    top: 0,
    left: 0,
    borderTopWidth: TICK_W,
    borderLeftWidth: TICK_W,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  tickTR: {
    top: 0,
    right: 0,
    borderTopWidth: TICK_W,
    borderRightWidth: TICK_W,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  tickBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: TICK_W,
    borderLeftWidth: TICK_W,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  tickBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: TICK_W,
    borderRightWidth: TICK_W,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },

  // Captured badge
  capturedBadge: {
    position: 'absolute',
    width: CAPTURED_SIZE,
    height: CAPTURED_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderRadius: CAPTURED_SIZE / 2,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  capturedCheck: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '900',
  },
  capturedLabel: {
    color: '#10B981',
    fontSize: 8,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginTop: 1,
  },

  // Edge arrow
  edgeArrow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
  },
  edgeChevron: {
    color: '#F59E0B',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
  },
  edgeLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.3,
  },
  edgeDeg: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 8,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
})
