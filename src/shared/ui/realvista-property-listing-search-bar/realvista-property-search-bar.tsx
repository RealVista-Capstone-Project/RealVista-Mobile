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
}

export function RealVistaPropertySearchBar({
  value: controlledValue,
  onChangeText,
  placeholder = 'Tìm kiếm địa điểm',
  onFilterPress,
  onFiltersChange,
  className = '',
}: RealVistaPropertySearchBarProps) {
  const [internalValue, setInternalValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({
    category: [],
    priceRange: { min: 5000000, max: 100000000 },
    bedrooms: 0,
    bathrooms: 0,
    rentalPeriod: 'Any',
  })

  const handleFilterPress = () => {
    console.log('Filter pressed')
    setIsFilterModalOpen(true)
    onFilterPress?.()
  }

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setIsFilterModalOpen(false)
    onFiltersChange?.(newFilters)
  }

  const value = controlledValue !== undefined ? controlledValue : internalValue
  const handleChangeText = (text: string) => {
    if (onChangeText) {
      onChangeText(text)
    } else {
      setInternalValue(text)
    }
  }

  return (
    <>
      <View
        className={`flex-row items-center rounded-lg border-2 bg-purple-98 px-4 py-3 ${
          isFocused ? 'border-brand-primary' : 'border-purple-92'
        } ${className}`}
      >
        {/* Search Icon */}
        <View className='mr-3'>
          <IconLucide name='Search' color='#7065F0' size={24} />
        </View>

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor='#6C727F'
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 font-['PlusJakartaSans_500Medium'] text-base text-main-black"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 16 }}
        />

        {/* Filter Button */}
        <TouchableOpacity
          onPress={handleFilterPress}
          className='ml-3 h-10 w-10 items-center justify-center rounded-lg bg-brand-primary'
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
      />
    </>
  )
}
