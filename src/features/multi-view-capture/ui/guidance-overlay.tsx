import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import type { GuidanceStatus } from '../model/use-capture-guidance'

type GuidanceOverlayProps = {
  message: string
  status: GuidanceStatus
  yaw: number
  pitch: number
}

const STATUS_COLORS: Record<GuidanceStatus, string> = {
  hold_steady: '#EF4444', // red
  move_to_new_angle: '#F59E0B', // amber
  ready: '#10B981', // green
  capturing: '#06B6D4', // cyan
}

export const GuidanceOverlay = React.memo(function GuidanceOverlay({
  message,
  status,
  yaw,
  pitch,
}: GuidanceOverlayProps) {
  const statusColor = STATUS_COLORS[status]

  const crosshairStyle = useMemo(
    () => [styles.crosshairRing, { borderColor: statusColor }],
    [statusColor]
  )

  const messageContainerStyle = useMemo(
    () => [styles.messageContainer, { backgroundColor: statusColor + 'CC' }],
    [statusColor]
  )

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Center crosshair */}
      <View style={styles.crosshairCenter}>
        <View style={crosshairStyle} />
        <View style={[styles.crosshairDot, { backgroundColor: statusColor }]} />
      </View>

      {/* Guidance message */}
      <View style={styles.messageArea}>
        <View style={messageContainerStyle}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>

      {/* Debug orientation info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Yaw: {yaw.toFixed(0)}° Pitch: {pitch.toFixed(0)}°
        </Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
  },
  crosshairDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messageArea: {
    position: 'absolute',
    bottom: 160,
    alignItems: 'center',
  },
  messageContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
  debugInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
})
