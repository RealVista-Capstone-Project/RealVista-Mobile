import { ActivityIndicator, ScrollView } from 'react-native'

import { useListingDetail } from '@/features/get-listing-detail'
import { Box } from '@/shared/ui/box'
import { Divider } from '@/shared/ui/divider'
import { type RealVistaPropertyCardData } from '@/shared/ui/realvista-property-listing-card'
import {
  PropertyAbout,
  PropertyActions,
  PropertyCostBreakdown,
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

// Mock similar listings (can be replaced with real API later)
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
  const { data: listing, isLoading, error } = useListingDetail()

  const handleToggleFavorite = (id: string) => {
    console.log('Toggle favorite:', id)
  }

  const handlePropertyClick = (id: string) => {
    console.log('Property clicked:', id)
  }

  // Loading state
  if (isLoading) {
    return (
      <Box className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size='large' color='#7065F0' />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box className='flex-1 items-center justify-center bg-white p-6'>
        <Box className='items-center gap-4'>
          <Box className='text-center'>
            <Box className='text-lg font-bold text-main-black mb-2'>Không thể tải thông tin</Box>
            <Box className='text-gray-500'>
              {error instanceof Error ? error.message : 'Đã có lỗi xảy ra'}
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  // No data state
  if (!listing) {
    return (
      <Box className='flex-1 items-center justify-center bg-white p-6'>
        <Box className='text-center'>
          <Box className='text-lg font-bold text-main-black mb-2'>Không tìm thấy tin đăng</Box>
        </Box>
      </Box>
    )
  }

  // Extract media URLs (ensure non-empty array to avoid runtime errors)
  const mediaUrls =
    Array.isArray(listing.media) && listing.media.length > 0
      ? listing.media.map((m) => m.media_url)
      : ['']

  // Construct effective agent from listing.agent or listing.user (fallback)
  const effectiveAgent =
    listing.agent ||
    (listing.user
      ? {
          user_id: listing.user.user_id || '',
          first_name: listing.user.first_name || '',
          last_name: listing.user.last_name || '',
          full_name: listing.user.full_name || listing.user.business_name || 'Người dùng',
          email: listing.user.email || '',
          phone: listing.user.phone || '',
          company: listing.user.business_name || '',
          business_name: listing.user.business_name || '',
          avatar_url:
            listing.user.avatar_url ||
            'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400',
          is_verified: listing.user.status === 'VERIFIED',
        }
      : null)

  // Transform cost_breakdown fees into pie chart data
  const chartData = (() => {
    const breakdown = listing.cost_breakdown
    if (!breakdown) return []

    const fees = [
      // Base price
      {
        label: 'Giá cơ bản',
        value: breakdown.base_price,
      },
      // Required fees
      ...(breakdown.required_fees?.map((fee) => ({
        label: fee.name,
        value: fee.amount,
      })) || []),
      // Optional fees
      ...(breakdown.optional_fees?.map((fee) => ({
        label: fee.name,
        value: fee.amount,
      })) || []),
    ]

    return fees
  })()

  return (
    <Box className='flex-1 bg-white'>
      <Box className='p-6'>
        <PropertyHeader />
      </Box>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <Box className='px-6'>
          <PropertyInfo name={listing.name} address={listing.property?.street_address || 'N/A'} />
          <PropertyActions />
          <PropertyImageCarousel images={mediaUrls} />

          <PropertySpecifications attributes={listing.attributes || []} status={listing.status} />

          <PropertyAbout
            description={listing.property?.descriptions || listing.descriptions || ''}
          />

          {effectiveAgent && <PropertyOwner agent={effectiveAgent as any} />}

          <PropertyTourRequest />

          <Divider className='my-6' />

          <PropertyFeatures />

          <Divider className='my-6' />

          <PropertyPriceHistory />

          <Divider className='my-6' />

          <PropertyMap
            latitude={listing.location?.latitude ?? 0}
            longitude={listing.location?.longitude ?? 0}
            address={listing.property?.street_address || 'N/A'}
            city={listing.location?.city_name || 'N/A'}
          />
        </Box>
        <Divider className='my-6' />
        <Box className='px-6'>
          <PropertyLegal />
        </Box>
        <Box className='px-6'>
          <PropertyCostBreakdown data={chartData} />
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
