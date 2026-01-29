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
  title = 'Price Range',
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
    <View style={{ marginBottom: 32 }}>
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
      <View>
        {/* Price Histogram */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            height: 56,
            marginBottom: 4,
            gap: 2,
            paddingHorizontal: 36,
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
        {/* Price Range Slider */}
        <View style={{ height: 40, marginBottom: 8, paddingHorizontal: 8 }}>
          <RangeSlider
            min={minValue}
            max={maxValue}
            low={internalLow}
            high={internalHigh}
            step={1000}
            floatingLabel={false}
            renderThumb={() => (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FFFF',
                  borderWidth: 2,
                  borderColor: '#7065F0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              />
            )}
            renderRail={() => (
              <View
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#E0DEF7',
                }}
              />
            )}
            renderRailSelected={() => (
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#7065F0',
                }}
              />
            )}
            onValueChanged={handleValueChange}
            onSliderTouchEnd={handleValueChangeFinish}
          />
        </View>
        {/* Price Labels */}
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}
        >
          <Text
            className="font-['PlusJakartaSans_700Bold'] text-base text-[#000929]"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#000929' }}
          >
            ${internalLow.toLocaleString()}
          </Text>
          <Text
            className="font-['PlusJakartaSans_700Bold'] text-base text-[#000929]"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#000929' }}
          >
            ${internalHigh.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  )
}
