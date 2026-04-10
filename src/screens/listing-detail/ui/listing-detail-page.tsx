import { type Href, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native'

import { type SimilarListing } from '@/entities/listing'
import { useToggleBookmark } from '@/features/bookmark'
import { ContactFormModal } from '@/features/chat'
import { useListingDetail } from '@/features/get-listing-detail'
import { useListingPriceHistory } from '@/features/get-listing-price-history'
import { useSimilarListings } from '@/features/get-similar-listings'
import { behaviorTracker } from '@/shared/lib/analytics'
import { LineChart, type ChartDataPoint } from '@/shared/ui/bna/line-chart'
import { Box } from '@/shared/ui/box'
import { Divider } from '@/shared/ui/divider'
import IconLucide from '@/shared/ui/icon-lucide/icon'
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
    attributes: listing.attributes || [],
  }
}

export function ListingDetailPage() {
  const router = useRouter()
  const { data: listing, isLoading, error } = useListingDetail()
  const { data: priceHistoryData } = useListingPriceHistory()
  const { listings: similarListings } = useSimilarListings(5)
  const { mutate: toggleBookmark } = useToggleBookmark()

  const [isFavorite, setIsFavorite] = useState(false)

  const has3D =
    (listing?.total_3d_tours ?? 0) > 0 ||
    (Array.isArray(listing?.media) && listing.media.some((m) => m.media_type === 'THREE_D'))

  useEffect(() => {
    setIsFavorite(listing?.is_favorite ?? false)
  }, [listing])

  const handleToggleFavorite = (id: string) => {
    behaviorTracker.trackBookmark(id, 'add', {
      listing_type: listing?.listing_type,
      property_type: listing?.propertyType?.property_type_name,
      price: listing?.price,
      source_page: 'detail',
    })
    toggleBookmark(id, {
      onSuccess: (data) => {
        setIsFavorite(!!data.bookmarked)
      },
    })
  }

  const handleToggleSimilarFavorite = (id: string) => {
    toggleBookmark(id)
  }

  const handlePropertyClick = (id: string) => {
    const similar = similarListings.find((l) => l.listing_id === id)
    behaviorTracker.trackClick(id, {
      listing_type: similar?.listing_type,
      price: similar?.price,
      source_page: 'similar',
    })
  }

  const handleBackToHome = () => {
    const href: Href =
      listing?.listing_type === 'RENT'
        ? { pathname: '/(tabs)/explore', params: { mode: 'rent' } }
        : '/(tabs)/explore'
    router.push(href)
  }

  useEffect(() => {
    if (listing) {
      behaviorTracker.trackView(listing.listing_id, {
        listing_type: listing.listing_type,
        property_type: listing.propertyType?.property_type_name,
        price: listing.price,
        source_page: 'detail',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.listing_id])

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
            <Text className='text-lg font-bold text-main-black mb-2'>Không thể tải thông tin</Text>
            <Text className='text-gray-500'>
              {error instanceof Error ? error.message : 'Đã có lỗi xảy ra'}
            </Text>
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
          <Text className='text-lg font-bold text-main-black mb-2'>Không tìm thấy tin đăng</Text>
        </Box>
      </Box>
    )
  }

  // Extract image-only media URLs (filter out THREE_D to avoid broken images)
  const mediaUrls =
    Array.isArray(listing.media) && listing.media.length > 0
      ? listing.media.filter((m) => m.media_type !== 'THREE_D').map((m) => m.media_url)
      : []

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
      <Box className='p-6'>
        <PropertyHeader />
      </Box>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <Box className='px-6'>
          <PropertyInfo name={listing.name} address={listing.property?.street_address || 'N/A'} />
          <PropertyActions
            listing={listing}
            isFavorite={isFavorite}
            onToggleFavorite={() => handleToggleFavorite(listing.listing_id)}
          />
          <PropertyImageCarousel images={mediaUrls} />

          {/* 3D Tour Card — shown separately below images when 3D is available */}
          {has3D && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/world-viewer?propertyId=${listing.property_id}`)}
              className='mb-6 rounded-2xl overflow-hidden'
              style={{
                backgroundColor: '#7065F0',
                shadowColor: '#7065F0',
                shadowOpacity: 0.35,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
              }}
            >
              <Box
                style={{
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                {/* Icon circle */}
                <Box
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconLucide name='Box' size={26} color='#FFFFFF' />
                </Box>

                {/* Text */}
                <Box style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 17,
                      fontWeight: '700',
                      fontFamily: 'PlusJakartaSans_700Bold',
                      marginBottom: 3,
                    }}
                  >
                    Khám phá không gian 3D
                  </Text>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: 13,
                      fontFamily: 'PlusJakartaSans_400Regular',
                    }}
                  >
                    Xem toàn bộ các phòng dưới dạng ảnh 3D
                  </Text>
                </Box>

                {/* Arrow */}
                <IconLucide name='ChevronRight' size={22} color='rgba(255,255,255,0.8)' />
              </Box>
            </TouchableOpacity>
          )}

          <PropertySpecifications attributes={listing.attributes || []} status={listing.status} />

          <PropertyAbout
            description={listing.property?.descriptions || listing.descriptions || ''}
          />

          {effectiveAgent && <PropertyOwner agent={effectiveAgent as any} listing={listing} />}

          <PropertyTourRequest listingId={listing.listing_id} />

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
          onToggleFavorite={handleToggleSimilarFavorite}
          onPropertyClick={handlePropertyClick}
        />

        {/* Back to Home Button */}
        <Box className='px-6 py-8'>
          <TouchableOpacity
            onPress={handleBackToHome}
            activeOpacity={0.7}
            className='bg-brand-primary rounded-lg py-3 px-4 items-center'
            style={{
              backgroundColor: '#7065F0',
              borderRadius: 8,
              paddingVertical: 12,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                fontFamily: 'PlusJakartaSans_600SemiBold',
              }}
            >
              ← Về trang chủ
            </Text>
          </TouchableOpacity>
        </Box>
      </ScrollView>

      <ContactFormModal />
    </Box>
  )
}
