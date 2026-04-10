import { Camera, Crosshair, RotateCcw, Timer } from 'lucide-react-native'
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

const STATUS_ICONS: Record<GuidanceStatus, React.ReactElement> = {
  hold_steady: <Crosshair size={12} color='#FFFFFF' strokeWidth={2.5} />,
  ready: <Timer size={12} color='#FFFFFF' strokeWidth={2.5} />,
  move_to_new_angle: <RotateCcw size={12} color='#FFFFFF' strokeWidth={2.5} />,
  capturing: <Camera size={12} color='#FFFFFF' strokeWidth={2.5} />,
}

// ─── Props ────────────────────────────────────────────────────────────────────
type ARHudOverlayProps = {
  status: GuidanceStatus
  message: string
  dwellProgress: number // 0..1
  isTracking: boolean
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

  const pillStyle = useMemo(
    () => [
      styles.messagePill,
      {
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderColor: color + '99',
      },
    ],
    [color]
  )

  const dotStyle = useMemo(() => [styles.statusDot, { backgroundColor: color }], [color])

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Centre crosshair with dwell ring */}
      <View style={styles.crosshairArea}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
          {/* Background ring */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke='rgba(255,255,255,0.15)'
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

      {/* Tracking banner OR status pill — mutually exclusive */}
      <View style={styles.messageArea}>
        {!isTracking ? (
          <View style={styles.trackingBanner}>
            <View style={styles.trackingDot} />
            <Text style={styles.trackingText}>Đang khởi tạo AR...</Text>
          </View>
        ) : (
          <View style={pillStyle}>
            <View style={dotStyle} />
            {STATUS_ICONS[status]}
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
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
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trackingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  trackingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  trackingText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.2,
  },
  messageArea: {
    position: 'absolute',
    bottom: 160,
    alignItems: 'center',
  },
  messagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  messageText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.3,
  },
})
