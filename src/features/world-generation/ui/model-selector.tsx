import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Zap, Sparkles } from 'lucide-react-native'

import type { MarbleModel } from '@/shared/api/marble-client'

type ModelSelectorProps = {
  selected: MarbleModel
  onSelect: (model: MarbleModel) => void
  disabled?: boolean
}

const MODELS: {
  id: MarbleModel
  label: string
  description: string
  time: string
  credits: string
  creditCount: string
  icon: React.ReactNode
}[] = [
  {
    id: 'Marble 0.1-mini',
    label: 'Nhanh',
    description: 'Phác thảo mặt bằng và xem trước phòng nhanh.',
    time: '~45 giây',
    credits: '1 CREDIT',
    creditCount: '1',
    icon: <Zap size={22} color='#7065F0' fill='#7065F0' />,
  },
  {
    id: 'Marble 0.1-plus',
    label: 'Tiêu chuẩn',
    description: 'Kết xuất kết cấu độ phân giải cao cho phòng 3D chất lượng.',
    time: '~5 phút',
    credits: '3 CREDITS',
    creditCount: '3',
    icon: <Sparkles size={22} color='#7065F0' />,
  },
]

export function ModelSelector({ selected, onSelect, disabled }: ModelSelectorProps) {
  return (
    <View style={styles.container}>
      {MODELS.map((m) => {
        const isSelected = selected === m.id
        return (
          <Pressable
            key={m.id}
            style={[
              styles.card,
              isSelected && styles.cardSelected,
              disabled && styles.cardDisabled,
            ]}
            onPress={() => onSelect(m.id)}
            disabled={disabled}
          >
            <View style={styles.cardTop}>
              <View style={styles.iconBox}>{m.icon}</View>
              <View style={[styles.creditBadge, isSelected && styles.creditBadgeSelected]}>
                <Text
                  style={[styles.creditBadgeText, isSelected && styles.creditBadgeTextSelected]}
                >
                  {m.credits}
                </Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
              {m.label}
            </Text>
            <Text style={styles.cardDesc}>{m.description}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cardSelected: {
    borderColor: '#7065F0',
    backgroundColor: '#FAFAFA',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(112, 101, 240, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  creditBadgeSelected: {
    backgroundColor: '#7065F0',
  },
  creditBadgeText: {
    color: '#6B7280',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.5,
  },
  creditBadgeTextSelected: {
    color: '#FFFFFF',
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: '#111827',
  },
  cardDesc: {
    color: '#6B7280',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 19,
  },
})
