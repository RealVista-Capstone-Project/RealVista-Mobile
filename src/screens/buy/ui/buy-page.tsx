import { Box } from '@/shared/ui/box'
import { OpenMapsButton } from '@/shared/ui/open-maps-button'
import {
  RealVistaPropertyCard,
  type RealVistaPropertyCardData,
} from '@/shared/ui/realvista-property-listing-card'
import { RealVistaPropertySearchBar } from '@/shared/ui/realvista-property-listing-search-bar'
import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Mock property data for buying (higher prices than renting)
const MOCK_PROPERTIES: RealVistaPropertyCardData[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    title: 'Palm Harbor',
    address: '2699 Green Valley, Highland Lake, FL',
    price: 15000000000,
    beds: 3,
    bathrooms: 2,
    area: 5,
    areaUnit: 'x7 m²',
    isPopular: true,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    title: 'Beverly Springfield',
    address: '2821 Lake Sevilla, Palm Harbor, TX',
    price: 18500000000,
    beds: 4,
    bathrooms: 2,
    area: 6,
    areaUnit: 'x7.5 m²',
    isPopular: true,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    title: 'Faulkner Ave',
    address: '909 Woodland St, Michigan, IN',
    price: 25000000000,
    beds: 4,
    bathrooms: 3,
    area: 8,
    areaUnit: 'x10 m²',
    isPopular: true,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    title: 'St. Crystal',
    address: '210 US Highway, Highland Lake, FL',
    price: 16000000000,
    beds: 4,
    bathrooms: 2,
    area: 6,
    areaUnit: 'x8 m²',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    title: 'Cove Red',
    address: '243 Curlew Road, Palm Harbor, TX',
    price: 12000000000,
    beds: 2,
    bathrooms: 1,
    area: 5,
    areaUnit: 'x7.5 m²',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
    title: 'The Old Steele',
    address: '103 Lake Shores, Michigan, IN',
    price: 13500000000,
    beds: 3,
    bathrooms: 1,
    area: 5,
    areaUnit: 'x7 m²',
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
    title: 'Sunset Villa',
    address: '456 Ocean Drive, Miami Beach, FL',
    price: 28000000000,
    beds: 5,
    bathrooms: 3,
    area: 9,
    areaUnit: 'x12 m²',
    isPopular: true,
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    title: 'Modern Loft',
    address: '789 Downtown Ave, Seattle, WA',
    price: 22000000000,
    beds: 2,
    bathrooms: 2,
    area: 6,
    areaUnit: 'x8.5 m²',
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    title: 'Garden Retreat',
    address: '321 Maple Street, Portland, OR',
    price: 17500000000,
    beds: 3,
    bathrooms: 2,
    area: 7,
    areaUnit: 'x9 m²',
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    title: 'Riverside Manor',
    address: '555 River Road, Austin, TX',
    price: 32000000000,
    beds: 4,
    bathrooms: 3,
    area: 8,
    areaUnit: 'x11 m²',
    isPopular: true,
  },
  {
    id: '11',
    image: 'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800',
    title: 'Urban Heights',
    address: '888 Skyline Blvd, Denver, CO',
    price: 21000000000,
    beds: 3,
    bathrooms: 2,
    area: 6,
    areaUnit: 'x8 m²',
  },
  {
    id: '12',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    title: 'Lakefront Estate',
    address: '999 Lakeside Drive, Minneapolis, MN',
    price: 38000000000,
    beds: 5,
    bathrooms: 4,
    area: 10,
    areaUnit: 'x13 m²',
    isPopular: true,
  },
  {
    id: '13',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    title: 'Blue Horizon',
    address: '123 Sky Way, Santa Monica, CA',
    price: 45000000000,
    beds: 4,
    bathrooms: 3,
    area: 9,
    areaUnit: 'x10 m²',
    isPopular: true,
  },
  {
    id: '14',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    title: 'Hillside Haven',
    address: '742 Terrace Dr, Boulder, CO',
    price: 27000000000,
    beds: 3,
    bathrooms: 2,
    area: 7,
    areaUnit: 'x8.5 m²',
  },
  {
    id: '15',
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800',
    title: 'Pinecrest Lodge',
    address: '88 Forest Ln, Tahoe, NV',
    price: 42000000000,
    beds: 5,
    bathrooms: 4,
    area: 12,
    areaUnit: 'x15 m²',
    isPopular: true,
  },
  {
    id: '16',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
    title: 'Seaside Sanctuary',
    address: '55 Coastal Path, Malibu, CA',
    price: 58000000000,
    beds: 4,
    bathrooms: 4,
    area: 11,
    areaUnit: 'x14 m²',
    isPopular: true,
  },
  {
    id: '17',
    image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800',
    title: 'Maple Cottage',
    address: '213 Willow St, Burlington, VT',
    price: 9500000000,
    beds: 2,
    bathrooms: 1,
    area: 4,
    areaUnit: 'x6 m²',
  },
  {
    id: '18',
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800',
    title: 'Skyline Penthouse',
    address: '101 highrise Blvd, Chicago, IL',
    price: 65000000000,
    beds: 3,
    bathrooms: 3,
    area: 8,
    areaUnit: 'x12 m²',
    isPopular: true,
  },
]

export function BuyPage() {
  const [searchText, setSearchText] = useState('Houston')
  const [properties, setProperties] = useState<RealVistaPropertyCardData[]>(() => MOCK_PROPERTIES)

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

  const handleOpenMaps = () => {
    console.log('Open maps pressed')
    // TODO: Navigate to map view
  }

  return (
    <SafeAreaView className='flex-1 bg-white' edges={['top']}>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <Box className='px-4 py-6'>
          {/* Search Bar */}
          <RealVistaPropertySearchBar
            value={searchText}
            onChangeText={setSearchText}
            onFilterPress={handleFilterPress}
            className='mb-6'
          />

          {/* Property Listings */}
          <View className='gap-6'>
            {properties.map((property) => (
              <RealVistaPropertyCard
                key={property.id}
                property={property}
                onClick={() => handlePropertyPress(property.id)}
                onToggleFavorite={() => handleFavoritePress(property.id)}
                variant='buy'
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
