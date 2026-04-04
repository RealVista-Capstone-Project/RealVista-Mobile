import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { parseSlotKey, PITCH_SLOTS, YAW_SLOTS } from '@/entities/capture'

type CoverageGridProps = {
  capturedSlots: Set<string>
  currentSlot: string
}

const CELL_SIZE = 14
const CELL_GAP = 2

export const CoverageGrid = React.memo(function CoverageGrid({
  capturedSlots,
  currentSlot,
}: CoverageGridProps) {
  const grid = useMemo(() => {
    const rows: React.ReactNode[] = []
    const currentParsed = parseSlotKey(currentSlot)

    for (let pitchIdx = PITCH_SLOTS - 1; pitchIdx >= 0; pitchIdx--) {
      const cells: React.ReactNode[] = []
      for (let yawIdx = 0; yawIdx < YAW_SLOTS; yawIdx++) {
        const key = `${yawIdx}-${pitchIdx}`
        const isCaptured = capturedSlots.has(key)
        const isCurrent = currentParsed.yawIndex === yawIdx && currentParsed.pitchIndex === pitchIdx

        let cellColor = 'rgba(255,255,255,0.15)' // uncaptured
        if (isCaptured) cellColor = '#10B981' // green
        if (isCurrent) cellColor = isCaptured ? '#059669' : '#3B82F6' // blue highlight

        cells.push(
          <View
            key={key}
            style={[styles.cell, { backgroundColor: cellColor }, isCurrent && styles.currentCell]}
          />
        )
      }
      rows.push(
        <View key={`row-${pitchIdx}`} style={styles.row}>
          {cells}
        </View>
      )
    }
    return rows
  }, [capturedSlots, currentSlot])

  return <View style={styles.container}>{grid}</View>
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
  },
  currentCell: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
})
