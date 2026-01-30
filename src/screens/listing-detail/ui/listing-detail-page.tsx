import { ScrollView } from 'react-native'

import { Box } from '@/shared/ui/box'
import { Divider } from '@/shared/ui/divider'
import { type RealVistaPropertyCardData } from '@/shared/ui/realvista-property-listing-card'
import {
  PropertyAbout,
  PropertyActions,
  PropertyFeatures,
  PropertyHeader,
  PropertyImageCarousel,
  PropertyInfo,
  PropertyLegal,
  PropertyMap,
  PropertyOwner,
  PropertyPriceHistory,
  PropertySimilarListings,
  PropertySpecifications,
  PropertyTourRequest,
} from './components'

interface Agent {
  name: string
  avatar: string
  rating: number
  reviews: number
}

interface Property {
  id: string
  title: string
  price: string
  location: string
  beds: number
  baths: number
  sqft: number
  description: string
  images: string[]
  agent: Agent
  latitude: number
  longitude: number
  city: string
}

const mockProperty: Property = {
  id: '1',
  title: 'Biệt Thự Gia Đình Sang Trọng với Tiện Nghi Hiện Đại',
  price: '$1,250,000',
  location: '123 Đường Oak, Beverly Hills, CA 90210',
  beds: 4,
  baths: 3,
  sqft: 2800,
  description:
    'Experience luxury living in this stunning 4-bedroom, 3-bathroom home featuring modern amenities throughout. The open-concept living area boasts high ceilings, hardwood floors, and abundant natural light. The gourmet kitchen includes top-of-the-line appliances, custom cabinetry, and a spacious island perfect for entertaining.\n\nAdditional features include a home office, media room, and a beautifully landscaped backyard with a pool and outdoor kitchen. Located in an exclusive neighborhood with top-rated schools and easy access to shopping, dining, and entertainment.',
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
  ],
  agent: {
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 4.9,
    reviews: 128,
  },
  latitude: 34.0736,
  longitude: -118.4004,
  city: 'Beverly Hills',
}

const mockSimilarListings: RealVistaPropertyCardData[] = [
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    title: 'Đại lộ Faulkner',
    address: 'Đường Woodland, Michigan, IN',
    price: 4550,
    beds: 3,
    bathrooms: 2,
    area: 57,
    isPopular: true,
    isFavorite: false,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    title: 'Căn hộ St. Crystal',
    address: 'Hồ Highland, FL',
    price: 2400,
    beds: 3,
    bathrooms: 2,
    area: 57,
    isPopular: false,
    isFavorite: true,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    title: 'Biệt Thự Hiện Đại',
    address: 'Bãi biển Palm, FL',
    price: 5200,
    beds: 4,
    bathrooms: 3,
    area: 85,
    isPopular: true,
    isFavorite: false,
  },
]

export function ListingDetailPage() {
  const handleToggleFavorite = (id: string) => {
    console.log('Toggle favorite:', id)
  }

  const handlePropertyClick = (id: string) => {
    console.log('Property clicked:', id)
  }

  return (
    <Box className='flex-1 bg-white'>
      <Box className='p-6'>
        <PropertyHeader />
      </Box>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <Box className='px-6'>
          <PropertyInfo />
          <PropertyActions />
          <PropertyImageCarousel images={mockProperty.images} />

          <PropertySpecifications beds={mockProperty.beds} baths={mockProperty.baths} />

          <PropertyAbout />

          <PropertyOwner agent={mockProperty.agent} />

          <PropertyTourRequest />

          <Divider className='my-6' />

          <PropertyFeatures />

          <Divider className='my-6' />

          <PropertyPriceHistory />

          <Divider className='my-6' />

          <PropertyMap
            latitude={mockProperty.latitude}
            longitude={mockProperty.longitude}
            address={mockProperty.location}
            city={mockProperty.city}
          />
        </Box>
        <Divider className='my-6' />
        <Box className='px-6'>
          <PropertyLegal />
        </Box>
        <PropertySimilarListings
          listings={mockSimilarListings}
          onToggleFavorite={handleToggleFavorite}
          onPropertyClick={handlePropertyClick}
        />
      </ScrollView>
    </Box>
  )
}
