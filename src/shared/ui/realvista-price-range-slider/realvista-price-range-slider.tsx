import { formatVND } from '@/shared/lib/format-currency'
import React, { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import RangeSlider from 'rn-range-slider'

export interface RealVistaPriceRangeSliderProps {
  minValue: number
  maxValue: number
  currentMin: number
  currentMax: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  histogramData: number[]
  title?: string
}

export function RealVistaPriceRangeSlider({
  minValue,
  maxValue,
  currentMin,
  currentMax,
  onMinChange,
  onMaxChange,
  histogramData,
  title = 'Khoảng giá',
}: RealVistaPriceRangeSliderProps) {
  // Calculate the maximum value for histogram normalization
  const maxHistogramValue = Math.max(...histogramData)

  // Internal state to track slider values during drag
  const [internalLow, setInternalLow] = useState(currentMin)
  const [internalHigh, setInternalHigh] = useState(currentMax)

  // Sync internal state when props change (e.g., when modal opens)
  useEffect(() => {
    setInternalLow(currentMin)
    setInternalHigh(currentMax)
  }, [currentMin, currentMax])

  // Update internal state during drag - doesn't trigger parent updates
  const handleValueChange = useCallback((low: number, high: number) => {
    setInternalLow(low)
    setInternalHigh(high)
  }, [])

  // Only update parent when dragging is complete
  const handleValueChangeFinish = useCallback(
    (low: number, high: number) => {
      onMinChange(low)
      onMaxChange(high)
    },
    [onMinChange, onMaxChange]
  )

  return (
    <View className='mb-8'>
      <Text className="font-['PlusJakartaSans_700Bold'] mb-4 text-[18px] text-[#000929]">
        {title}
      </Text>
      <View>
        {/* Price Histogram */}
        <View className='flex-row items-end h-14 mb-1 gap-[2px] px-9'>
          {histogramData.map((value, index) => {
            const heightPercentage = maxHistogramValue > 0 ? (value / maxHistogramValue) * 100 : 0
            return (
              <View
                key={index}
                className='flex-1 bg-[#E5E7EB] rounded-[2px]'
                style={{
                  height: `${heightPercentage}%`,
                }}
              />
            )
          })}
        </View>
        {/* Price Range Slider */}
        <View className='h-10 mb-2 px-2'>
          <RangeSlider
            min={minValue}
            max={maxValue}
            low={internalLow}
            high={internalHigh}
            step={1000}
            floatingLabel={false}
            renderThumb={() => (
              <View
                className='w-5 h-5 rounded-full bg-white border-2 border-[#7065F0]'
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              />
            )}
            renderRail={() => <View className='flex-1 h-1 rounded-[2px] bg-[#E0DEF7]' />}
            renderRailSelected={() => <View className='h-1 rounded-[2px] bg-[#7065F0]' />}
            onValueChanged={handleValueChange}
            onSliderTouchEnd={handleValueChangeFinish}
          />
        </View>
        {/* Price Labels */}
        <View className='flex-row justify-between px-2'>
          <Text className="font-['PlusJakartaSans_700Bold'] text-[18px] text-[#000929]">
            {formatVND(internalLow)}
          </Text>
          <Text className="font-['PlusJakartaSans_700Bold'] text-[18px] text-[#000929]">
            {formatVND(internalHigh)}
          </Text>
        </View>
      </View>
    </View>
  )
}
