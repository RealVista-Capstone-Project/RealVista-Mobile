import { Text } from '@/shared/ui/text'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Path, Svg } from 'react-native-svg'

interface OpenMapsButtonProps {
  onPress?: () => void
  className?: string
}

export function OpenMapsButton({ onPress, className = '' }: OpenMapsButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center gap-2 rounded-lg bg-[#100A55] px-6 py-3 ${className}`}
    >
      <MapsIcon />
      <Text
        className="font-['PlusJakartaSans_700Bold'] text-base text-white"
        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
      >
        Mở Google Maps
      </Text>
    </TouchableOpacity>
  )
}

// Maps Icon Component
function MapsIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M13.3333 5.83333L17.5 3.33333V14.1667L13.3333 16.6667M13.3333 5.83333L6.66667 3.33333M13.3333 5.83333V16.6667M6.66667 3.33333L2.5 5.83333V16.6667L6.66667 14.1667M6.66667 3.33333V14.1667M6.66667 14.1667L13.3333 16.6667'
        stroke='white'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}
