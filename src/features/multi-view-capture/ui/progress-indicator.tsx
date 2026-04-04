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
  low: '#EF4444',
  good: '#F59E0B',
  excellent: '#10B981',
}

const COVERAGE_LABELS: Record<CoverageLevel, string> = {
  low: 'Low',
  good: 'Good',
  excellent: 'Excellent',
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
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  shotCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 4,
  },
  coverageLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
  },
})
