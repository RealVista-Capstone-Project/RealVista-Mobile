import { formatVND } from '@/shared/lib/format-currency'
import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import {
  RealVistaPropertyCard,
  type RealVistaPropertyCardData,
} from '@/shared/ui/realvista-property-listing-card'
import { RealVistaPropertySearchBar } from '@/shared/ui/realvista-property-listing-search-bar'
import { Text } from '@/shared/ui/text'
import React, { useRef, useState } from 'react'
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'

// Price bubble marker for map view
function PriceMarker({ price }: { price: number }) {
  return (
    <View style={styles.markerContainer}>
      <View style={styles.markerBubble}>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 13,
            color: '#100A55',
          }}
        >
          {formatVND(price)}
        </Text>
      </View>
      {/* Marker triangle */}
      <View style={styles.markerTriangle} />
    </View>
  )
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -1,
  },
})

// Default map region (Ho Chi Minh City area)
const HCMC_REGION = {
  latitude: 10.78,
  longitude: 106.69,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

// Mock property data based on Figma designs
type PropertyWithCoords = RealVistaPropertyCardData & {
  latitude: number
  longitude: number
}

const MOCK_PROPERTIES: PropertyWithCoords[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    title: 'Palm Harbor',
    address: '2699 Green Valley, Highland Lake, FL',
    price: 2000000000,
    beds: 3,
    bathrooms: 2,
    area: 5,
    areaUnit: 'x7 m²',
    isPopular: true,
    latitude: 10.795,
    longitude: 106.678,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    title: 'Beverly Springfield',
    address: '2821 Lake Sevilla, Palm Harbor, TX',
    price: 27000000,
    beds: 4,
    bathrooms: 2,
    area: 6,
    areaUnit: 'x7.5 m²',
    isPopular: true,
    latitude: 10.782,
    longitude: 106.7,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    title: 'Faulkner Ave',
    address: '909 Woodland St, Michigan, IN',
    price: 45000000,
    beds: 4,
    bathrooms: 3,
    area: 8,
    areaUnit: 'x10 m²',
    isPopular: true,
    latitude: 10.77,
    longitude: 106.685,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    title: 'St. Crystal',
    address: '210 US Highway, Highland Lake, FL',
    price: 24000000,
    beds: 4,
    bathrooms: 2,
    area: 6,
    areaUnit: 'x8 m²',
    latitude: 10.758,
    longitude: 106.71,
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    title: 'Cove Red',
    address: '243 Curlew Road, Palm Harbor, TX',
    price: 15000000,
    beds: 2,
    bathrooms: 1,
    area: 5,
    areaUnit: 'x7.5 m²',
    latitude: 10.8,
    longitude: 106.66,
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
    title: 'The Old Steele',
    address: '103 Lake Shores, Michigan, IN',
    price: 16000000,
    beds: 3,
    bathrooms: 1,
    area: 5,
    areaUnit: 'x7 m²',
    latitude: 10.773,
    longitude: 106.72,
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
    title: 'Sunset Villa',
    address: '456 Ocean Drive, Miami Beach, FL',
    price: 32000000,
    beds: 5,
    bathrooms: 3,
    area: 9,
    areaUnit: 'x12 m²',
    isPopular: true,
    latitude: 10.81,
    longitude: 106.695,
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    title: 'Modern Loft',
    address: '789 Downtown Ave, Seattle, WA',
    price: 29000000,
    beds: 2,
    bathrooms: 2,
    area: 6,
    areaUnit: 'x8.5 m²',
    latitude: 10.765,
    longitude: 106.67,
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    title: 'Garden Retreat',
    address: '321 Maple Street, Portland, OR',
    price: 21000000,
    beds: 3,
    bathrooms: 2,
    area: 7,
    areaUnit: 'x9 m²',
    latitude: 10.788,
    longitude: 106.645,
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    title: 'Riverside Manor',
    address: '555 River Road, Austin, TX',
    price: 38000000,
    beds: 4,
    bathrooms: 3,
    area: 8,
    areaUnit: 'x11 m²',
    isPopular: true,
    latitude: 10.75,
    longitude: 106.69,
  },
  {
    id: '11',
    image: 'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800',
    title: 'Urban Heights',
    address: '888 Skyline Blvd, Denver, CO',
    price: 26500000,
    beds: 3,
    bathrooms: 2,
    area: 6,
    areaUnit: 'x8 m²',
    latitude: 10.805,
    longitude: 106.715,
  },
  {
    id: '12',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    title: 'Lakefront Estate',
    address: '999 Lakeside Drive, Minneapolis, MN',
    price: 42000000,
    beds: 5,
    bathrooms: 4,
    area: 10,
    areaUnit: 'x13 m²',
    isPopular: true,
    latitude: 10.74,
    longitude: 106.675,
  },
  {
    id: '13',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    title: 'Blue Horizon',
    address: '123 Sky Way, Santa Monica, CA',
    price: 52000000,
    beds: 4,
    bathrooms: 3,
    area: 9,
    areaUnit: 'x10 m²',
    isPopular: true,
    latitude: 10.792,
    longitude: 106.73,
  },
  {
    id: '14',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    title: 'Hillside Haven',
    address: '742 Terrace Dr, Boulder, CO',
    price: 34000000,
    beds: 3,
    bathrooms: 2,
    area: 7,
    areaUnit: 'x8.5 m²',
    latitude: 10.775,
    longitude: 106.655,
  },
  {
    id: '15',
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800',
    title: 'Pinecrest Lodge',
    address: '88 Forest Ln, Tahoe, NV',
    price: 48000000,
    beds: 5,
    bathrooms: 4,
    area: 12,
    areaUnit: 'x15 m²',
    isPopular: true,
    latitude: 10.815,
    longitude: 106.705,
  },
  {
    id: '16',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
    title: 'Seaside Sanctuary',
    address: '55 Coastal Path, Malibu, CA',
    price: 65000000,
    beds: 4,
    bathrooms: 4,
    area: 11,
    areaUnit: 'x14 m²',
    isPopular: true,
    latitude: 10.762,
    longitude: 106.74,
  },
  {
    id: '17',
    image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800',
    title: 'Maple Cottage',
    address: '213 Willow St, Burlington, VT',
    price: 18000000,
    beds: 2,
    bathrooms: 1,
    area: 4,
    areaUnit: 'x6 m²',
    latitude: 10.785,
    longitude: 106.665,
  },
  {
    id: '18',
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800',
    title: 'Skyline Penthouse',
    address: '101 highrise Blvd, Chicago, IL',
    price: 72000000,
    beds: 3,
    bathrooms: 3,
    area: 8,
    areaUnit: 'x12 m²',
    isPopular: true,
    latitude: 10.798,
    longitude: 106.725,
  },
]

export function RentPage() {
  const [searchText, setSearchText] = useState('Houston')
  const [searchMode, setSearchMode] = useState<'list' | 'map'>('list')
  const [properties, setProperties] = useState<PropertyWithCoords[]>(() => MOCK_PROPERTIES)
  const mapRef = useRef<MapView>(null)

  // Sync properties with MOCK_PROPERTIES on mount to fix cached state
  React.useEffect(() => {
    setProperties(MOCK_PROPERTIES)
  }, [])
  const handleFilterPress = () => {
    console.log('Filter pressed')
    // TODO: Implement filter functionality
  }

  const handlePropertyPress = (propertyId: string) => {
    console.log('Property pressed:', propertyId)
    // TODO: Navigate to property details
  }

  const handleFavoritePress = (propertyId: string) => {
    setProperties((prevProperties) =>
      prevProperties.map((property) =>
        property.id === propertyId ? { ...property, isFavorite: !property.isFavorite } : property
      )
    )
  }

  const toggleSearchMode = () => {
    setSearchMode((prev) => (prev === 'list' ? 'map' : 'list'))
  }

  return (
    <SafeAreaView className='flex-1 bg-white' edges={['top']}>
      <Box className='px-4 pt-6 pb-2'>
        {/* Search Bar + Toggle Button Row */}
        <View className='mb-4 flex-row items-center gap-3'>
          <View className='flex-1'>
            <RealVistaPropertySearchBar
              value={searchText}
              onChangeText={setSearchText}
              onFilterPress={handleFilterPress}
              showLeaseTerm={true}
            />
          </View>

          {/* Search Mode Toggle Button */}
          <TouchableOpacity
            onPress={toggleSearchMode}
            activeOpacity={0.7}
            className='h-10 w-10 items-center justify-center rounded-lg border-[1.5px] border-purple-92 bg-white'
          >
            <IconLucide
              name={searchMode === 'list' ? 'Map' : 'LayoutGrid'}
              color='#100A55'
              size={20}
            />
          </TouchableOpacity>
        </View>
      </Box>

      {searchMode === 'list' ? (
        /* List View */
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          <Box className='px-4 pb-6'>
            <View className='gap-6'>
              {properties.map((property) => (
                <RealVistaPropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => handlePropertyPress(property.id)}
                  onToggleFavorite={() => handleFavoritePress(property.id)}
                  variant='rent'
                />
              ))}
            </View>
          </Box>
        </ScrollView>
      ) : (
        /* Map View */
        <View className='flex-1'>
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={{ flex: 1 }}
            initialRegion={HCMC_REGION}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {properties.map((property) => (
              <Marker
                key={property.id}
                coordinate={{
                  latitude: property.latitude,
                  longitude: property.longitude,
                }}
                tracksViewChanges={false}
              >
                <PriceMarker price={property.price} />
              </Marker>
            ))}
          </MapView>

          {/* Bottom Bar — property count */}
          <View
            className='absolute bottom-0 left-0 right-0 items-center rounded-t-2xl bg-white px-6 pb-8 pt-4'
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.07,
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            {/* Handle indicator */}
            <View className='mb-3 h-[5px] w-14 rounded-full bg-grey-200' />
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 16,
                color: '#100A55',
                textAlign: 'center',
              }}
            >
              {properties.length} bất động sản cho thuê
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}
