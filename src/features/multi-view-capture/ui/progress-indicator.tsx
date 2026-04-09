import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

import type { CoverageLevel } from '@/entities/capture'

type ProgressIndicatorProps = {
  progress: number // 0–1
  imageCount: number
  totalSlots: number
  coverageLevel: CoverageLevel
}

const SIZE = 72
const STROKE_WIDTH = 5
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const COVERAGE_COLORS: Record<CoverageLevel, string> = {
  low: '#94A3B8', // Slate (Neutral/Initial)
  good: '#F59E0B', // Amber
  excellent: '#10B981', // Emerald
}

const COVERAGE_LABELS: Record<CoverageLevel, string> = {
  low: 'Thấp',
  good: 'Tốt',
  excellent: 'Xuất sắc',
}

export const ProgressIndicator = React.memo(function ProgressIndicator({
  progress,
  imageCount,
  totalSlots,
  coverageLevel,
}: ProgressIndicatorProps) {
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const percentText = `${Math.round(progress * 100)}%`
  const color = COVERAGE_COLORS[coverageLevel]
  const label = COVERAGE_LABELS[coverageLevel]

  const progressTextStyle = useMemo(() => [styles.progressText, { color }], [color])

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        <Svg width={SIZE} height={SIZE}>
          {/* Background track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke='rgba(255,255,255,0.2)'
            strokeWidth={STROKE_WIDTH}
            fill='transparent'
          />
          {/* Progress arc */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            fill='transparent'
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap='round'
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={progressTextStyle}>{percentText}</Text>
        </View>
      </View>

      <Text style={styles.shotCount}>
        {imageCount}/{totalSlots}
      </Text>
      <Text style={[styles.coverageLabel, { color }]}>{label}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ringContainer: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.5,
  },
  shotCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginTop: 6,
  },
  coverageLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
