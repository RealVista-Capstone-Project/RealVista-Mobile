import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

import type { GuidanceStatus } from './use-ar-dwell'

// ─── Constants ────────────────────────────────────────────────────────────────
const RING_SIZE = 88
const RING_STROKE = 3
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const STATUS_COLORS: Record<GuidanceStatus, string> = {
  hold_steady: '#EF4444',
  ready: '#10B981',
  move_to_new_angle: '#F59E0B',
  capturing: '#06B6D4',
}

// ─── Props ────────────────────────────────────────────────────────────────────
type ARHudOverlayProps = {
  status: GuidanceStatus
  message: string
  dwellProgress: number // 0..1
  isTracking: boolean
  yaw: number
  pitch: number
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ARHudOverlay = React.memo(function ARHudOverlay({
  status,
  message,
  dwellProgress,
  isTracking,
}: ARHudOverlayProps) {
  const color = STATUS_COLORS[status]
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - dwellProgress)

  const pillStyle = useMemo(() => [styles.messagePill, { backgroundColor: color + 'CC' }], [color])

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Centre crosshair with dwell ring */}
      <View style={styles.crosshairArea}>
        {/* SVG dwell progress arc */}
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
          {/* Background ring */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke='rgba(255,255,255,0.2)'
            strokeWidth={RING_STROKE}
            fill='none'
          />
          {/* Progress arc */}
          {dwellProgress > 0 && (
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={color}
              strokeWidth={RING_STROKE + 1}
              fill='none'
              strokeDasharray={`${RING_CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap='round'
              rotation={-90}
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          )}
        </Svg>

        {/* Centre dot */}
        <View style={[styles.centreDot, { backgroundColor: color }]} />
      </View>

      {/* Tracking status indicator */}
      {!isTracking && (
        <View style={styles.trackingBanner}>
          <Text style={styles.trackingText}>Searching for surfaces...</Text>
        </View>
      )}

      {/* Status message pill */}
      <View style={styles.messageArea}>
        <View style={pillStyle}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </View>
  )
})

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringSvg: {
    position: 'absolute',
  },
  centreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trackingBanner: {
    position: 'absolute',
    top: 120,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  trackingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  messageArea: {
    position: 'absolute',
    bottom: 160,
    alignItems: 'center',
  },
  messagePill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
})
