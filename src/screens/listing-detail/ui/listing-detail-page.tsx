import { ActivityIndicator, ScrollView } from 'react-native'

import { type SimilarListing } from '@/entities/listing'
import { useLogout } from '@/features/auth'
import { ContactFormModal } from '@/features/chat'
import { useListingDetail } from '@/features/get-listing-detail'
import { useListingPriceHistory } from '@/features/get-listing-price-history'
import { useSimilarListings } from '@/features/get-similar-listings'
import { LineChart, type ChartDataPoint } from '@/shared/ui/bna/line-chart'
import { Box } from '@/shared/ui/box'
import { Button, ButtonText } from '@/shared/ui/button'
import { Divider } from '@/shared/ui/divider'
import { type RealVistaPropertyCardData } from '@/shared/ui/realvista-property-listing-card'
import { Text } from '@/shared/ui/text'
import {
  PropertyAbout,
  PropertyActions,
  PropertyAmenities,
  PropertyCostBreakdown,
  PropertyHeader,
  PropertyImageCarousel,
  PropertyInfo,
  PropertyLegal,
  PropertyMap,
  PropertyOwner,
  PropertySimilarListings,
  PropertySpecifications,
  PropertyTourRequest,
} from './components'

/**
 * Transform SimilarListing API response to RealVistaPropertyCardData format
 */
function transformSimilarListing(listing: SimilarListing): RealVistaPropertyCardData {
  // Extract bedrooms and bathrooms from attributes
  const bedrooms =
    listing.attributes.find((a) => a.attribute_code === 'BEDROOMS')?.value_number ?? 0
  const bathrooms =
    listing.attributes.find((a) => a.attribute_code === 'BATHROOMS')?.value_number ?? 0

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
  const { data: priceHistoryData } = useListingPriceHistory()
  const { listings: similarListings } = useSimilarListings(5)

  const { mutate: logout } = useLogout()

  const handleToggleFavorite = (id: string) => {
    console.log('Toggle favorite:', id)
  }

  const handlePropertyClick = (id: string) => {
    console.log('Property clicked:', id)
  }

  // Transform similar listings to card format
  const similarListingsCards: RealVistaPropertyCardData[] =
    similarListings.map(transformSimilarListing)

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

  // Transform price history data for LineChart - limit to 5 most recent entries
  const lineChartData: ChartDataPoint[] = (() => {
    if (!priceHistoryData?.price_history?.length) return []

    // Sort by date descending (newest first), then take last 5
    const sortedByDateDesc = [...priceHistoryData.price_history].sort(
      (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    )

    // Take only 5 most recent entries
    const recentHistory = sortedByDateDesc.slice(0, 5)

    // Sort back to ascending order for the chart (oldest to newest)
    const sortedHistory = recentHistory.sort(
      (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
    )

    return sortedHistory.map((entry) => {
      const date = new Date(entry.changed_at)
      const month = date.getMonth() + 1
      const year = date.getFullYear().toString().slice(-2)
      const label = `T${month}/${year}`
      return {
        x: label,
        y: entry.price,
        label,
      }
    })
  })()

  console.log('amenities', listing.amenities)
  return (
    <Box className='flex-1 bg-white'>
      <Box className='p-6 flex-row justify-between items-center'>
        <PropertyHeader />
        <Button
          size='sm'
          action='negative'
          variant='outline'
          onPress={() => logout()}
          className='rounded-full'
        >
          <ButtonText>Đăng xuất</ButtonText>
        </Button>
      </Box>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <Box className='px-6'>
          <PropertyInfo name={listing.name} address={listing.property?.street_address || 'N/A'} />
          <PropertyActions listing={listing} />
          <PropertyImageCarousel images={mediaUrls} />

          <PropertySpecifications attributes={listing.attributes || []} status={listing.status} />

          <PropertyAbout description={listing.property?.description || ''} />

          <PropertyOwner agent={listing.agent} listing={listing} />

          <PropertyTourRequest />

          <Divider className='my-6' />

          <PropertyAmenities amenities={listing.amenities || []} />
          {/* <Divider className='my-6' /> */}
          {/* <PropertyFeatures /> */}

          <Divider className='my-6' />

          {/* Price History Chart */}
          {lineChartData.length > 0 ? (
            <Box className='mb-4'>
              <Text size='lg' bold className='text-main-black mb-4'>
                Lịch sử giá
              </Text>
              <LineChart
                data={lineChartData}
                config={{
                  height: 200,
                  showGrid: true,
                  showLabels: true,
                  animated: true,
                  gradient: true,
                  showYLabels: true,
                  yLabelCount: 5,
                  yAxisWidth: 50,
                }}
              />
            </Box>
          ) : null}

          <Divider className='my-6' />

          {/* <PropertyPriceHistory /> */}

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

      <ContactFormModal />
    </Box>
  )
}
