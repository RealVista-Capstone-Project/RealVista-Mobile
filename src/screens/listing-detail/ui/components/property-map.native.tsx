import { useRef, useState } from 'react'
import { Linking, Platform, TouchableOpacity, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps'
import { Path, Svg } from 'react-native-svg'

import { MAP_CONFIG } from '@/shared/config/maps'
import { lightColors } from '@/shared/theme/color'
import { OpenMapsButton } from '@/shared/ui/open-maps-button'
import { Text } from '@/shared/ui/text'

interface PropertyMapProps {
  latitude: number
  longitude: number
  address: string
  city?: string
}

export function PropertyMap({ latitude, longitude, address, city = 'Houston' }: PropertyMapProps) {
  const mapRef = useRef<MapView>(null)
  const [region, setRegion] = useState<Region>({
    latitude,
    longitude,
    latitudeDelta: MAP_CONFIG.DEFAULT_LATITUDE_DELTA,
    longitudeDelta: MAP_CONFIG.DEFAULT_LONGITUDE_DELTA,
  })

  const handleZoomIn = () => {
    const newLatDelta = Math.max(
      region.latitudeDelta * MAP_CONFIG.ZOOM_IN_DELTA,
      MAP_CONFIG.MIN_ZOOM_DELTA
    )
    const newLngDelta = Math.max(
      region.longitudeDelta * MAP_CONFIG.ZOOM_IN_DELTA,
      MAP_CONFIG.MIN_ZOOM_DELTA
    )
    const newRegion = {
      ...region,
      latitudeDelta: newLatDelta,
      longitudeDelta: newLngDelta,
    }
    setRegion(newRegion)
    mapRef.current?.animateToRegion(newRegion, 300)
  }

  const handleZoomOut = () => {
    const newLatDelta = Math.min(
      region.latitudeDelta * MAP_CONFIG.ZOOM_OUT_DELTA,
      MAP_CONFIG.MAX_ZOOM_DELTA
    )
    const newLngDelta = Math.min(
      region.longitudeDelta * MAP_CONFIG.ZOOM_OUT_DELTA,
      MAP_CONFIG.MAX_ZOOM_DELTA
    )
    const newRegion = {
      ...region,
      latitudeDelta: newLatDelta,
      longitudeDelta: newLngDelta,
    }
    setRegion(newRegion)
    mapRef.current?.animateToRegion(newRegion, 300)
  }

  const handleOpenMaps = () => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    })
    const latLng = `${latitude},${longitude}`
    const label = encodeURIComponent(address)
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    })

    if (url) {
      Linking.openURL(url)
    }
  }

  const handleSeeMoreListings = () => {
    // Navigate to search with city filter - to be implemented
    console.log(`See more listings in ${city}`)
  }

  const handleRecenter = () => {
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    }
    setRegion(newRegion)
    mapRef.current?.animateToRegion(newRegion, 300)
  }

  return (
    <View className='gap-8'>
      {/* Section Title */}
      <Text className='font-jakarta-bold text-xl leading-8 tracking-tight text-main-black'>
        Bản đồ
      </Text>

      {/* Map Container */}
      <View className='gap-6'>
        <View className='relative h-[300px] overflow-hidden rounded-lg'>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Marker coordinate={{ latitude, longitude }} title={address}>
              <PropertyMarker />
            </Marker>
          </MapView>

          {/* Zoom Controls */}
          <View className='absolute right-3 top-1/2 -translate-y-1/2'>
            <View className='overflow-hidden rounded-lg border-[1.5px] border-purple-92 bg-main-white'>
              <TouchableOpacity
                onPress={handleRecenter}
                className='h-10 w-10 items-center justify-center border-b border-purple-92'
                activeOpacity={0.7}
              >
                <LocateIcon />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleZoomIn}
                className='h-10 w-10 items-center justify-center border-b border-purple-92'
                activeOpacity={0.7}
              >
                <Text className='text-lg font-bold text-main-secondary'>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleZoomOut}
                className='h-10 w-10 items-center justify-center'
                activeOpacity={0.7}
              >
                <Text className='text-lg font-bold text-main-secondary'>−</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Open Google Maps Button */}
          <View className='absolute bottom-4 left-4'>
            <OpenMapsButton onPress={handleOpenMaps} />
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
 * Custom property marker matching Figma design
 */
function PropertyMarker() {
  return (
    <View className='items-center'>
      <View className='h-10 w-10 items-center justify-center rounded-full bg-main-primary'>
        <HomeIcon />
      </View>
      {/* Marker tail */}
      <View
        className='h-0 w-0'
        style={{
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: lightColors.mainPrimary,
          marginTop: -2,
        }}
      />
    </View>
  )
}

/**
 * Home icon for marker
 */
function HomeIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M3.33333 10L10 3.33333L16.6667 10M5 8.33333V15.8333C5 16.2754 5.35817 16.6667 5.83333 16.6667H8.33333V12.5C8.33333 12.0398 8.70643 11.6667 9.16667 11.6667H10.8333C11.2936 11.6667 11.6667 12.0398 11.6667 12.5V16.6667H14.1667C14.6269 16.6667 15 16.2754 15 15.8333V8.33333'
        stroke='white'
        strokeWidth={1.5}
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
/**
 * Locate icon for recentering map
 */
function LocateIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z'
        stroke='#100A55'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Path
        d='M12 2V4M12 20V22M22 12H20M4 12H2'
        stroke='#100A55'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}
