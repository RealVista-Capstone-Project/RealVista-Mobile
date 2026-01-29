import Slider from '@react-native-community/slider'
import React from 'react'
import { Text, View } from 'react-native'

export interface PriceRangeSliderProps {
  minValue: number
  maxValue: number
  currentMin: number
  currentMax: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  histogramData: number[]
  title?: string
}

export function PriceRangeSlider({
  minValue,
  maxValue,
  currentMin,
  currentMax,
  onMinChange,
  onMaxChange,
  histogramData,
  title = 'Price Range',
}: PriceRangeSliderProps) {
  // Calculate the maximum value for histogram normalization
  const maxHistogramValue = Math.max(...histogramData)

  return (
    <View>
      <Text
        className="font-['PlusJakartaSans_700Bold'] mb-4 text-base text-[#000929]"
        style={{
          fontFamily: 'PlusJakartaSans_700Bold',
          fontSize: 18,
          marginBottom: 16,
          color: '#000929',
        }}
      >
        {title}
      </Text>
      <View style={{ paddingHorizontal: 8 }}>
        {/* Price Histogram */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            height: 56,
            marginBottom: 8,
            gap: 2,
          }}
        >
          {histogramData.map((value, index) => {
            const heightPercentage = maxHistogramValue > 0 ? (value / maxHistogramValue) * 100 : 0
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: `${heightPercentage}%`,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 2,
                }}
              />
            )
          })}
        </View>
        {/* Price Range Sliders */}
        <View style={{ marginBottom: 16 }}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={minValue}
            maximumValue={maxValue}
            value={currentMin}
            onValueChange={onMinChange}
            minimumTrackTintColor='#7065F0'
            maximumTrackTintColor='#E0DEF7'
            thumbTintColor='#7065F0'
          />
          <Slider
            style={{ width: '100%', height: 40, marginTop: -20 }}
            minimumValue={minValue}
            maximumValue={maxValue}
            value={currentMax}
            onValueChange={onMaxChange}
            minimumTrackTintColor='#7065F0'
            maximumTrackTintColor='#E0DEF7'
            thumbTintColor='#7065F0'
          />
        </View>
        {/* Price Labels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            className="font-['PlusJakartaSans_700Bold'] text-base text-[#000929]"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#000929' }}
          >
            ${currentMin.toLocaleString()}
          </Text>
          <Text
            className="font-['PlusJakartaSans_700Bold'] text-base text-[#000929]"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#000929' }}
          >
            ${currentMax.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  )
}
