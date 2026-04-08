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
        {/* Draft Model Option */}
        <Pressable
          style={[
            styles.option,
            selected === 'Marble 0.1-mini' && styles.optionSelected,
            disabled && styles.optionDisabled,
          ]}
          onPress={() => onSelect('Marble 0.1-mini')}
          disabled={disabled}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionTitle,
                selected === 'Marble 0.1-mini' && styles.optionTitleSelected,
              ]}
            >
              Draft
            </Text>
            <Text style={styles.optionMeta}>~45s • 250 credits</Text>
          </View>
        </Pressable>

        {/* Standard Model Option */}
        <Pressable
          style={[
            styles.option,
            selected === 'Marble 0.1-plus' && styles.optionSelected,
            disabled && styles.optionDisabled,
          ]}
          onPress={() => onSelect('Marble 0.1-plus')}
          disabled={disabled}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionTitle,
                selected === 'Marble 0.1-plus' && styles.optionTitleSelected,
              ]}
            >
              Standard
            </Text>
            <Text style={styles.optionMeta}>~5 min • 1,600 credits</Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    width: '100%',
  },
  options: {
    flexDirection: 'row',
    gap: 16,
    alignSelf: 'stretch',
  },
  option: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // Slate background
    borderRadius: 24,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  optionContent: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  optionSelected: {
    borderColor: '#7065F0',
    backgroundColor: 'rgba(112, 101, 240, 0.08)',
    shadowColor: '#7065F0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  optionTitleSelected: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  optionMeta: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontWeight: '600',
    textAlign: 'center',
  },
})
