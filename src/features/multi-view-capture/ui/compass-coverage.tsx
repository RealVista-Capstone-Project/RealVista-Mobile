/**
 * CompassCoverage — zero-lag flat compass strip.
 *
 * All 8 slot dots are rendered once at fixed positions in a wide scrolling
 * track. Per-tick, only a single Animated.Value (translateX) is mutated —
 * no React reconciliation on every sensor update.
 *
 * Three copies of the dot row are rendered side-by-side so the strip wraps
 * seamlessly when yaw crosses 0°/360°.
 */
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

import { YAW_SLOTS, YAW_STEP } from '@/entities/capture'

type CompassCoverageProps = {
  capturedSlots: Set<string>
  currentYaw: number
  currentSlot: string
}

// ─── Layout constants ────────────────────────────────────────────────────────
const VISIBLE_WIDTH = 300
const SLOT_SPACING = 54 // px between slot centres
const FULL_WIDTH = YAW_SLOTS * SLOT_SPACING // 432px for one full revolution
const DOT_R = 10
const TRACK_HEIGHT = 72
const DOT_Y = 36 // vertical centre of dots inside track

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

// ─── Static dot track (rendered once, never re-computed on yaw change) ───────
interface DotTrackProps {
  capturedSlots: Set<string>
  currentSlot: string
  offsetDeg: number // 0 | 360 | -360  — which copy of the track
}

const DotTrack = React.memo(function DotTrack({
  capturedSlots,
  currentSlot,
  offsetDeg,
}: DotTrackProps) {
  const offsetPx = (offsetDeg / 360) * FULL_WIDTH

  return (
    <>
      {Array.from({ length: YAW_SLOTS }, (_, yi) => {
        const deg = yi * YAW_STEP
        const slotKey = `${yi}-0`
        const isCaptured = capturedSlots.has(slotKey)
        const isCurrent = slotKey === currentSlot
        const cx = VISIBLE_WIDTH / 2 + offsetPx + (yi - YAW_SLOTS / 2) * SLOT_SPACING

        let dotColor: string
        if (isCurrent) dotColor = isCaptured ? '#059669' : '#3B82F6'
        else if (isCaptured) dotColor = '#10B981'
        else dotColor = 'rgba(107,114,128,0.7)'

        const r = isCurrent ? DOT_R * 1.3 : DOT_R * 0.85

        return (
          <View
            key={`${offsetDeg}-${yi}`}
            style={[
              styles.dotWrapper,
              {
                left: cx - DOT_R * 1.5,
                top: DOT_Y - DOT_R * 1.5,
                width: DOT_R * 3,
                height: DOT_R * 3,
              },
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  width: r * 2,
                  height: r * 2,
                  borderRadius: r,
                  backgroundColor: dotColor,
                  borderWidth: isCurrent ? 2 : 0,
                  borderColor: '#FFFFFF',
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isCurrent ? '#FFFFFF' : 'rgba(156,163,175,0.8)',
                  fontSize: isCurrent ? 10 : 8,
                  fontWeight: isCurrent ? '800' : '500',
                },
              ]}
            >
              {DIRECTION_LABELS[deg] ?? `${deg}°`}
            </Text>
          </View>
        )
      })}
    </>
  )
})

// ─── Main compass component ───────────────────────────────────────────────────
export const CompassCoverage = React.memo(function CompassCoverage({
  capturedSlots,
  currentYaw,
  currentSlot,
}: CompassCoverageProps) {
  const translateX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Map yaw → translateX so the current heading stays centred.
    // Normalise into [-FULL_WIDTH/2, FULL_WIDTH/2] for smooth wrap.
    let raw = -((currentYaw / 360) * FULL_WIDTH)
    // Keep within one period
    raw = ((raw % FULL_WIDTH) + FULL_WIDTH) % FULL_WIDTH
    if (raw > FULL_WIDTH / 2) raw -= FULL_WIDTH

    Animated.spring(translateX, {
      toValue: raw,
      useNativeDriver: true,
      damping: 22,
      stiffness: 280,
      mass: 0.6,
      overshootClamping: false,
    }).start()
  }, [currentYaw, translateX])

  return (
    <View style={styles.wrapper}>
      {/* Centre cursor */}
      <View style={styles.cursor} />

      <View style={styles.track}>
        <Animated.View style={[styles.slidingRow, { transform: [{ translateX }] }]}>
          {/* Three copies for seamless wrap-around */}
          <DotTrack capturedSlots={capturedSlots} currentSlot={currentSlot} offsetDeg={-360} />
          <DotTrack capturedSlots={capturedSlots} currentSlot={currentSlot} offsetDeg={0} />
          <DotTrack capturedSlots={capturedSlots} currentSlot={currentSlot} offsetDeg={360} />
        </Animated.View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    width: VISIBLE_WIDTH,
    height: TRACK_HEIGHT + 10,
    alignItems: 'center',
  },
  cursor: {
    position: 'absolute',
    top: 2,
    width: 2,
    height: 10,
    borderRadius: 1,
    backgroundColor: '#7065F0',
    zIndex: 10,
  },
  track: {
    width: VISIBLE_WIDTH,
    height: TRACK_HEIGHT,
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginTop: 6,
  },
  slidingRow: {
    position: 'absolute',
    width: VISIBLE_WIDTH,
    height: TRACK_HEIGHT,
  },
  dotWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    alignSelf: 'center',
  },
  label: {
    marginTop: 2,
    letterSpacing: 0.3,
  },
})
