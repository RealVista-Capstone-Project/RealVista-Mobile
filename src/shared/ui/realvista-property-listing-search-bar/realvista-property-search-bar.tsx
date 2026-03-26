import IconLucide from '@/shared/ui/icon-lucide/icon'
import React, { useState } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'
import { RealVistaPropertyFilterModal, type FilterValues } from './realvista-property-filter-modal'

type RealVistaPropertySearchBarProps = {
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  onFilterPress?: () => void
  onFiltersChange?: (filters: FilterValues) => void
  className?: string
  showLeaseTerm?: boolean
  initialFilters?: Partial<FilterValues>
  /** Max price for slider in filter modal. Default: 10B (SALE). Use 100M for RENT. */
  maxPriceLimit?: number
}

export function RealVistaPropertySearchBar({
  value: controlledValue,
  onChangeText,
  placeholder = 'Tìm kiếm địa điểm',
  onFilterPress,
  onFiltersChange,
  className = '',
  showLeaseTerm = true,
  initialFilters = {},
  maxPriceLimit,
}: RealVistaPropertySearchBarProps) {
  const onChangeTextRef = React.useRef(onChangeText)
  const [isFocused, setIsFocused] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({
    propertyCategory: undefined,
    minPrice: undefined, // No constraint by default — pages pass their own defaults
    maxPrice: undefined,
    dynamicAttributes: {},
    rentalPeriod: 'Any',
    ...initialFilters,
  })

  const handleFilterPress = () => {
    // if (__DEV__) console.log('Filter pressed')
    setIsFilterModalOpen(true)
    onFilterPress?.()
  }

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setIsFilterModalOpen(false)
    onFiltersChange?.(newFilters)
  }

  // Local state for debounce
  const [localValue, setLocalValue] = useState(controlledValue || '')

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue)
    }
  }, [controlledValue])

  React.useEffect(() => {
    onChangeTextRef.current = onChangeText
  }, [onChangeText])

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (onChangeTextRef.current) {
        onChangeTextRef.current(localValue)
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [localValue])

  const handleChangeText = (text: string) => {
    setLocalValue(text)
  }

  return (
    <>
      <View className={`flex-row items-center ${className}`}>
        <View
          className={`h-11 flex-1 flex-row items-center rounded-lg bg-purple-98 px-3 ${
            isFocused ? 'border-brand-primary' : 'border-purple-92'
          }`}
        >
          {/* Search Icon */}
          <View className='mr-2'>
            <IconLucide name='Search' color='#7065F0' size={18} />
          </View>

          {/* Text Input */}
          <TextInput
            value={localValue}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor='#6C727F'
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className='font-jakarta-medium text-sm text-main-black'
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={handleFilterPress}
          className='ml-2 h-10 w-10 items-center justify-center rounded-lg bg-brand-primary'
          activeOpacity={0.7}
        >
          <IconLucide name='SlidersHorizontal' color='white' size={20} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <RealVistaPropertyFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        showLeaseTerm={showLeaseTerm}
        maxPriceLimit={maxPriceLimit}
      />
    </>
  )
}
