import { Text } from '@/shared/ui/text'
import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { Path, Svg } from 'react-native-svg'

export interface PropertyData {
  id: string
  image: string
  price: number
  period?: string
  name: string
  address: string
  beds: number
  baths: number
  area: number
  isPopular?: boolean
  isFavorite?: boolean
}

interface PropertyCardProps {
  property: PropertyData
  onPress?: () => void
  onFavoritePress?: () => void
  className?: string
}

export function PropertyCard({
  property,
  onPress,
  onFavoritePress,
  className = '',
}: PropertyCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className={`w-full overflow-hidden rounded-lg border-[1.5px] border-[#F0EFFB] bg-white ${className}`}
    >
      {/* Property Image */}
      <View className='relative h-[233px] w-full'>
        <Image source={{ uri: property.image }} className='h-full w-full' resizeMode='cover' />

        {/* Popular Badge */}
        {property.isPopular && (
          <View className='absolute left-3 top-3 rounded-md bg-[#7065F0] px-3 py-1.5'>
            <Text
              className="font-['PlusJakartaSans_700Bold'] text-xs text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
            >
              POPULAR
            </Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={onFavoritePress}
          className='absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-white/90'
          activeOpacity={0.7}
        >
          <HeartIcon filled={property.isFavorite} />
        </TouchableOpacity>
      </View>

      {/* Property Details */}
      <View className='p-4'>
        {/* Price */}
        <Text
          className="font-['PlusJakartaSans_700Bold'] text-2xl text-[#7065F0]"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24 }}
        >
          ${property.price.toLocaleString()}
          <Text
            className="font-['PlusJakartaSans_500Medium'] text-base text-[#000929]"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 16 }}
          >
            {property.period || '/month'}
          </Text>
        </Text>

        {/* Property Name */}
        <Text
          className="mt-2 font-['PlusJakartaSans_700Bold'] text-xl text-[#000929]"
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 20,
            letterSpacing: -1,
          }}
        >
          {property.name}
        </Text>

        {/* Address */}
        <Text
          className="mt-1 font-['PlusJakartaSans_500Medium'] text-sm text-gray-500"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
        >
          {property.address}
        </Text>

        {/* Amenities */}
        <View className='mt-3 flex-row items-center gap-4'>
          {/* Beds */}
          <View className='flex-row items-center gap-1.5'>
            <BedIcon />
            <Text
              className="font-['PlusJakartaSans_500Medium'] text-sm text-[#000929]"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
            >
              {property.beds}
            </Text>
          </View>

          {/* Baths */}
          <View className='flex-row items-center gap-1.5'>
            <BathIcon />
            <Text
              className="font-['PlusJakartaSans_500Medium'] text-sm text-[#000929]"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
            >
              {property.baths}
            </Text>
          </View>

          {/* Area */}
          <View className='flex-row items-center gap-1.5'>
            <AreaIcon />
            <Text
              className="font-['PlusJakartaSans_500Medium'] text-sm text-[#000929]"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
            >
              {property.area}×7 m²
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// Heart Icon
function HeartIcon({ filled = false }: { filled?: boolean }) {
  if (filled) {
    return (
      <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
        <Path
          d='M10 17.5C10 17.5 2.5 13.75 2.5 7.91667C2.5 6.75544 2.96094 5.64181 3.78141 4.82134C4.60188 4.00087 5.71551 3.53993 6.87674 3.53993C8.28571 3.53993 9.44118 4.21569 10 5.24157C10.5588 4.21569 11.7143 3.53993 13.1233 3.53993C14.2845 3.53993 15.3981 4.00087 16.2186 4.82134C17.0391 5.64181 17.5 6.75544 17.5 7.91667C17.5 13.75 10 17.5 10 17.5Z'
          fill='#7065F0'
          stroke='#7065F0'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </Svg>
    )
  }

  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M10 17.5C10 17.5 2.5 13.75 2.5 7.91667C2.5 6.75544 2.96094 5.64181 3.78141 4.82134C4.60188 4.00087 5.71551 3.53993 6.87674 3.53993C8.28571 3.53993 9.44118 4.21569 10 5.24157C10.5588 4.21569 11.7143 3.53993 13.1233 3.53993C14.2845 3.53993 15.3981 4.00087 16.2186 4.82134C17.0391 5.64181 17.5 6.75544 17.5 7.91667C17.5 13.75 10 17.5 10 17.5Z'
        stroke='#7065F0'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}

// Bed Icon
function BedIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M2.5 14.1667V8.33333M2.5 8.33333V5.83333C2.5 5.3731 2.8731 5 3.33333 5H16.6667C17.1269 5 17.5 5.3731 17.5 5.83333V8.33333M2.5 8.33333H17.5M17.5 8.33333V14.1667M2.5 14.1667H17.5M2.5 14.1667V15.8333M17.5 14.1667V15.8333M5.83333 8.33333V6.66667M14.1667 8.33333V6.66667'
        stroke='#7065F0'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}

// Bath Icon
function BathIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M3.33333 7.5V5.83333C3.33333 4.91286 4.07953 4.16667 5 4.16667C5.92047 4.16667 6.66667 4.91286 6.66667 5.83333V7.5M3.33333 7.5H16.6667M3.33333 7.5V11.6667C3.33333 13.5076 4.82572 15 6.66667 15H13.3333C15.1743 15 16.6667 13.5076 16.6667 11.6667V7.5M5 15V16.6667M15 15V16.6667'
        stroke='#7065F0'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}

// Area Icon
function AreaIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M14.1667 2.5L17.5 5.83333M17.5 5.83333L14.1667 9.16667M17.5 5.83333H10.8333M5.83333 17.5L2.5 14.1667M2.5 14.1667L5.83333 10.8333M2.5 14.1667H9.16667M5.83333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V5.83333M14.1667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V14.1667'
        stroke='#7065F0'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}
