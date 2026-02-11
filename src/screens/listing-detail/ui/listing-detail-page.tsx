import { ActivityIndicator, ScrollView } from 'react-native'

import { useListingDetail } from '@/features/get-listing-detail'
import { useSimilarListings } from '@/features/get-similar-listings'
import { type SimilarListing } from '@/entities/listing'
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

/**
 * Transform SimilarListing API response to RealVistaPropertyCardData format
 */
function transformSimilarListing(listing: SimilarListing): RealVistaPropertyCardData {
  // Extract bedrooms and bathrooms from attributes
  const bedrooms = listing.attributes.find((a) => a.attribute_code === 'BEDROOMS')?.value_number ?? 0
  const bathrooms = listing.attributes.find((a) => a.attribute_code === 'BATHROOMS')?.value_number ?? 0

  return {
    id: listing.listing_id,
    image: listing.thumbnail_url,
    title: listing.name,
    address: listing.location_name,
    price: listing.price,
    beds: bedrooms,
    bathrooms: bathrooms,
    area: listing.area,
    areaUnit: listing.display_area,
    isPopular: listing.similarity_score === 100,
    isFavorite: false,
  }
}

export function ListingDetailPage() {
  const { data: listing, isLoading, error } = useListingDetail()
  const { listings: similarListings } = useSimilarListings(5)

  const handleToggleFavorite = (id: string) => {
    console.log('Toggle favorite:', id)
  }

  const handlePropertyClick = (id: string) => {
    console.log('Property clicked:', id)
  }

  // Transform similar listings to card format
  const similarListingsCards: RealVistaPropertyCardData[] = similarListings.map(transformSimilarListing)

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

          <PropertyAbout description={listing.property?.description || ''} />

          <PropertyOwner agent={listing.agent} />

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
          listings={similarListingsCards}
          onToggleFavorite={handleToggleFavorite}
          onPropertyClick={handlePropertyClick}
        />
      </ScrollView>
    </Box>
  )
}
