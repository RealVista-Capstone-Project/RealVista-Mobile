import { Box } from '@/shared/ui/box'
import { OpenMapsButton } from '@/shared/ui/open-maps-button'
import { PropertyCard, type PropertyData } from '@/shared/ui/property-card'
import { PropertySearchBar } from '@/shared/ui/realvista-property-listing-search-bar'
import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Path, Svg } from 'react-native-svg'

// Mock property data based on Figma designs
const MOCK_PROPERTIES: PropertyData[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    price: 4550,
    period: '/month',
    name: 'Faulkner Ave',
    address: '520 Wines Lane, Houston, TX',
    beds: 3,
    baths: 2,
    area: 5,
    isPopular: true,
    isFavorite: false,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    price: 2400,
    period: '/month',
    name: 'St. Crystal',
    address: '2016 Poe Road, Houston, TX',
    beds: 3,
    baths: 2,
    area: 5,
    isPopular: false,
    isFavorite: false,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    price: 2095,
    period: '/month',
    name: 'Palm Harbor',
    address: '1842 Circle Drive, Houston, TX',
    beds: 3,
    baths: 2,
    area: 5,
    isPopular: false,
    isFavorite: false,
  },
]

export function RentPage() {
  const [searchText, setSearchText] = useState('Houston')
  const [properties, setProperties] = useState<PropertyData[]>(MOCK_PROPERTIES)

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

  const handleOpenMaps = () => {
    console.log('Open maps pressed')
    // TODO: Navigate to map view
  }

  return (
    <SafeAreaView className='flex-1 bg-white' edges={['top']}>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <Box className='px-4 py-6'>
          {/* Search Bar */}
          <PropertySearchBar
            value={searchText}
            onChangeText={setSearchText}
            onFilterPress={handleFilterPress}
            className='mb-6'
          />

          {/* Property Listings */}
          <View className='gap-6'>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => handlePropertyPress(property.id)}
                onFavoritePress={() => handleFavoritePress(property.id)}
              />
            ))}
          </View>

          {/* Open Maps Button */}
          <OpenMapsButton onPress={handleOpenMaps} className='mt-6' />
        </Box>
      </ScrollView>
    </SafeAreaView>
  )
}

// Chevron Icon for Breadcrumb
function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox='0 0 16 16' fill='none'>
      <Path
        d='M6 12L10 8L6 4'
        stroke='#9CA3AF'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}
