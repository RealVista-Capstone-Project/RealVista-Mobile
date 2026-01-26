import { ScrollView } from 'react-native'

import { Box } from '@/shared/ui/box'
import { Divider } from '@/shared/ui/divider'
import {
  PropertyAbout,
  PropertyActions,
  PropertyFeatures,
  PropertyHeader,
  PropertyImageCarousel,
  PropertyInfo,
  PropertyLegal,
  PropertyOwner,
  PropertyPriceHistory,
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
}

const mockProperty: Property = {
  id: '1',
  title: 'Luxury Family Home with Modern Amenities',
  price: '$1,250,000',
  location: '123 Oak Street, Beverly Hills, CA 90210',
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
}

export function ListingDetailPage() {
  return (
    <Box className='flex-1 bg-white p-6'>
      <PropertyHeader />

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
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

        <PropertyLegal />
      </ScrollView>
    </Box>
  )
}
