import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import IconLucide from '../icon-lucide/icon'
import React from 'react'
import { View } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'

interface DirectionPieChartProps {
  onPress?: (direction: string) => void
  selectedDirection?: string
}

// Short labels that fit in slice and center naturally (full name stored in `code` for display)
const DIRECTIONS = [
  { value: 12.5, text: 'Bắc', code: 'Bắc', color: '#60A5FA' },
  { value: 12.5, text: 'ĐB', code: 'Đông Bắc', color: '#D97706' },
  { value: 12.5, text: 'Đông', code: 'Đông', color: '#10B981' },
  { value: 12.5, text: 'ĐN', code: 'Đông Nam', color: '#34D399' },
  { value: 12.5, text: 'Nam', code: 'Nam', color: '#EF4444' },
  { value: 12.5, text: 'TN', code: 'Tây Nam', color: '#F59E0B' },
  { value: 12.5, text: 'Tây', code: 'Tây', color: '#94A3B8' },
  { value: 12.5, text: 'TB', code: 'Tây Bắc', color: '#64748B' },
]

export function DirectionPieChart({ onPress, selectedDirection }: DirectionPieChartProps) {
  // 8 Slices = 45deg each.
  // User feedback: 157.5 deg puts North at 1h.
  // 1h is approx +30-45deg from 12h.
  // To move from 1h to 12h (CCW), subtract ~45deg.
  // 157.5 - 45 = 112.5

  const pieData = DIRECTIONS.map((item) => {
    const isSelected = selectedDirection === item.code
    return {
      value: item.value,
      text: item.text, // Short label, fits centered in slice
      color: isSelected ? '#4F46E5' : item.color,
      code: item.code,
      focused: isSelected,
      innerRadius: 75,
      strokeColor: 'white',
      strokeWidth: 2,
    }
  })

  return (
    <Box className='mb-4 w-full items-center pl-0'>
      <Text className='mb-6 text-gray-500 w-full text-left font-medium' size='sm'>
        Chọn Hướng nhà
      </Text>

      <View style={{ alignItems: 'center', position: 'relative' }}>
        {/* Simple Compass Ring */}
        <View
          style={{
            position: 'absolute',
            top: -5,
            bottom: -5,
            left: -5,
            right: -5,
            borderWidth: 2,
            borderColor: '#F1F5F9',
            borderRadius: 200,
            zIndex: -1,
          }}
        />

        <PieChart
          data={pieData}
          donut
          showText
          textColor='white'
          radius={140}
          innerRadius={75}
          textSize={12}
          fontWeight='bold'
          initialAngle={125.27} //Keep this to make it center
          innerCircleColor={'#ffffff'}
          centerLabelComponent={() => {
            return (
              <View
                style={{ justifyContent: 'center', alignItems: 'center', width: 90, height: 90 }}
              >
                <View style={{ marginBottom: 4 }}>
                  <IconLucide
                    name='Compass'
                    size={28}
                    color={selectedDirection ? '#4F46E5' : '#CBD5E1'}
                  />
                </View>
                {selectedDirection ? (
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#0F172A',
                      fontWeight: '800',
                      textAlign: 'center',
                    }}
                  >
                    {selectedDirection}
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#94A3B8',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    Chọn hướng
                  </Text>
                )}
              </View>
            )
          }}
          onPress={(item: any) => {
            if (onPress && item.code) {
              if (selectedDirection === item.code) {
                onPress('')
              } else {
                onPress(item.code)
              }
            }
          }}
        />
      </View>
    </Box>
  )
}
