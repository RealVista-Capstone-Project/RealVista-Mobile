import React, { useState } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'
import { Circle, Path, Svg } from 'react-native-svg'

interface PropertySearchBarProps {
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  onFilterPress?: () => void
  className?: string
}

export function PropertySearchBar({
  value: controlledValue,
  onChangeText,
  placeholder = 'Search location',
  onFilterPress,
  className = '',
}: PropertySearchBarProps) {
  const [internalValue, setInternalValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const value = controlledValue !== undefined ? controlledValue : internalValue
  const handleChangeText = (text: string) => {
    if (onChangeText) {
      onChangeText(text)
    } else {
      setInternalValue(text)
    }
  }

  const hasValue = value.length > 0

  return (
    <View
      className={`flex-row items-center rounded-lg border-2 bg-[#F7F7FD] px-4 py-3 ${
        isFocused ? 'border-[#7065F0]' : 'border-[#E0DEF7]'
      } ${className}`}
    >
      {/* Search Icon */}
      <View className='mr-3'>
        <SearchIcon color={isFocused || hasValue ? '#7065F0' : '#7065F0'} />
      </View>

      {/* Text Input */}
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor='#9CA3AF'
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 font-['PlusJakartaSans_500Medium'] text-base text-[#000929]"
        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 16 }}
      />

      {/* Filter Button */}
      <TouchableOpacity
        onPress={onFilterPress}
        className='ml-3 h-10 w-10 items-center justify-center rounded-lg bg-[#7065F0]'
        activeOpacity={0.7}
      >
        <FilterIcon />
      </TouchableOpacity>
    </View>
  )
}

// Search Icon Component
function SearchIcon({ color = '#7065F0' }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
      <Circle
        cx={11}
        cy={11}
        r={7}
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Path
        d='M20 20L16.65 16.65'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}

// Filter Icon Component
function FilterIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M2.5 5.83333H6.66667M6.66667 5.83333C6.66667 7.214 7.78595 8.33333 9.16667 8.33333C10.5474 8.33333 11.6667 7.214 11.6667 5.83333M6.66667 5.83333C6.66667 4.45262 7.78595 3.33333 9.16667 3.33333C10.5474 3.33333 11.6667 4.45262 11.6667 5.83333M11.6667 5.83333H17.5M2.5 14.1667H8.33333M8.33333 14.1667C8.33333 15.5474 9.45262 16.6667 10.8333 16.6667C12.214 16.6667 13.3333 15.5474 13.3333 14.1667M8.33333 14.1667C8.33333 12.786 9.45262 11.6667 10.8333 11.6667C12.214 11.6667 13.3333 12.786 13.3333 14.1667M13.3333 14.1667H17.5'
        stroke='white'
        strokeWidth={1.5}
        strokeLinecap='round'
      />
    </Svg>
  )
}
