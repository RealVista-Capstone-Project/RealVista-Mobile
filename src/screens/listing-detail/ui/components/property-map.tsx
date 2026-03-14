import { Linking, TouchableOpacity, View } from 'react-native'
import { Path, Svg } from 'react-native-svg'

import { lightColors } from '@/shared/theme/color'
import { OpenMapsButton } from '@/shared/ui/open-maps-button'
import { Text } from '@/shared/ui/text'

interface PropertyMapProps {
  latitude: number
  longitude: number
  address: string
  city?: string
}

/**
 * Web-compatible version of PropertyMap
 * Displays a fallback UI with an action to open in Google Maps
 */
export function PropertyMap({ latitude, longitude, address, city = 'Houston' }: PropertyMapProps) {
  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    Linking.openURL(url)
  }

  const handleSeeMoreListings = () => {
    // Navigate to search with city filter - to be implemented
    console.log(`See more listings in ${city}`)
  }

  return (
    <View className='gap-8'>
      {/* Section Title */}
      <Text className='font-jakarta-bold text-xl leading-8 tracking-tight text-main-black'>
        Bản đồ
      </Text>

      {/* Map Placeholder Container */}
      <View className='gap-6'>
        <View className='relative h-[300px] overflow-hidden rounded-lg bg-purple-98 items-center justify-center border border-purple-92'>
          {/* Decorative Map Pattern / Icon */}
          <View className='items-center gap-4 opacity-40'>
            <View className='h-16 w-16 items-center justify-center rounded-full bg-main-primary/10'>
              <MapIcon />
            </View>
            <View className='items-center'>
              <Text className='font-jakarta-bold text-sm text-main-secondary text-center max-w-[200px]'>
                {address}
              </Text>
              <Text className='text-xs text-main-secondary/60'>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Open Google Maps Button Overlay */}
          <View className='absolute bottom-4 left-4'>
            <OpenMapsButton onPress={handleOpenMaps} />
          </View>

          <View className='absolute inset-0 items-center justify-center'>
            <TouchableOpacity
              onPress={handleOpenMaps}
              className='bg-main-white/90 px-6 py-3 rounded-full shadow-sm border border-purple-92'
              activeOpacity={0.8}
            >
              <Text className='font-jakarta-bold text-main-primary'>Mở trong Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* See More Listings Link */}
        <TouchableOpacity
          onPress={handleSeeMoreListings}
          className='flex-row items-center gap-2'
          activeOpacity={0.7}
        >
          <Text className='font-jakarta-bold text-base text-main-primary'>
            Xem thêm bất động sản tại {city}
          </Text>
          <ChevronRightIcon />
        </TouchableOpacity>
      </View>
    </View>
  )
}

/**
 * Simple map icon for fallback UI
 */
function MapIcon() {
  return (
    <Svg width={32} height={32} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z'
        stroke={lightColors.mainPrimary}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Path
        d='M9 3V18M15 6V21'
        stroke={lightColors.mainPrimary}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}

/**
 * Chevron right icon for "See more listings" link
 */
function ChevronRightIcon() {
  return (
    <Svg width={16} height={16} viewBox='0 0 16 16' fill='none'>
      <Path
        d='M6 12L10 8L6 4'
        stroke={lightColors.mainPrimary}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}
