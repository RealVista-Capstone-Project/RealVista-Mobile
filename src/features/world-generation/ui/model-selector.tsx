import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { MarbleModel } from '@/shared/api/marble-client'

type ModelSelectorProps = {
  selected: MarbleModel
  onSelect: (model: MarbleModel) => void
  disabled?: boolean
}

export function ModelSelector({ selected, onSelect, disabled }: ModelSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.options}>
        <Pressable
          style={[styles.option, selected === 'Marble 0.1-mini' && styles.optionSelected]}
          onPress={() => onSelect('Marble 0.1-mini')}
          disabled={disabled}
        >
          <Text
            style={[
              styles.optionTitle,
              selected === 'Marble 0.1-mini' && styles.optionTitleSelected,
            ]}
          >
            Draft
          </Text>
          <Text style={styles.optionMeta}>~45s • 250 credits</Text>
        </Pressable>

        <Pressable
          style={[styles.option, selected === 'Marble 0.1-plus' && styles.optionSelected]}
          onPress={() => onSelect('Marble 0.1-plus')}
          disabled={disabled}
        >
          <Text
            style={[
              styles.optionTitle,
              selected === 'Marble 0.1-plus' && styles.optionTitleSelected,
            ]}
          >
            Standard
          </Text>
          <Text style={styles.optionMeta}>~5 min • 1,600 credits</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  options: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionTitle: {
    color: '#F3F4F6',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#34D399', // Brighter emerald
  },
  optionMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontWeight: '500',
  },
})
