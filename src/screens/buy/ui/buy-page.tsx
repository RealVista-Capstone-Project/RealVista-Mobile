import { useListingSearch } from '@/features/search/use-listing-search'
import { Box } from '@/shared/ui/box'
import { resolveListingCategoryLabel } from '@/shared/lib/resolve-listing-category-label'
import { behaviorTracker } from '@/shared/lib/analytics'
import {
  RealVistaPropertyHorizontalCard,
  type RealVistaPropertyCardData,
} from '@/shared/ui/realvista-property-listing-card'
import {
  RealVistaPropertySearchBar,
  type FilterValues,
} from '@/shared/ui/realvista-property-listing-search-bar'
import { RecommendedListings } from '@/widgets/recommended-listings'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useToggleBookmark } from '@/features/bookmark'
import { useMapSearch } from '@/features/map-search/api'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { RealVistaMapSearchView } from '@/shared/ui/realvista-map-search-view'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

function getListingAddress(listing: {
  street_address?: string
  full_address?: string
  location?: string
}): string {
  return (
    listing.street_address || listing.full_address || listing.location || 'Đang cập nhật địa chỉ'
  )
}

export function BuyPage() {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isMapView, setIsMapView] = useState(false)
  const { mutate: toggleBookmark } = useToggleBookmark()
  const {
    listings,
    isLoading,
    isFetchingNextPage,
    error,
    search,
    updateCriteria,
    criteria,
    nextPage,
  } = useListingSearch({
    listingType: 'SALE',
  })
  const {
    markers,
    totalCount,
    isLoading: isMapLoading,
    onRegionChange,
  } = useMapSearch({
    listingType: 'SALE',
    enabled: isMapView,
    filters: {
      min_price: criteria.minPrice,
      max_price: criteria.maxPrice,
      search_text: criteria.location,
      category: criteria.propertyCategory,
    },
  })

  // Map API listings to UI card data
  const propertyCardData: RealVistaPropertyCardData[] = useMemo(() => {
    return listings.map((listing) => ({
      id: listing.listing_id,
      image: listing.thumbnail || 'https://via.placeholder.com/800',
      title: listing.name,
      address: getListingAddress(listing),
      categoryLabel: resolveListingCategoryLabel({
        title: listing.name,
        propertyTypeCode: criteria.propertyType,
        propertyCategoryCode: criteria.propertyCategory,
      }),
      price: listing.price,
      beds: listing.bedrooms || 0,
      bathrooms: listing.bathrooms || 0,
      area: listing.area,
      areaUnit: 'm²',
      isPopular: listing.boosted || false,
      isFavorite: listing.is_favorite || false,
      status: listing.status,
      attributes: listing.attributes || [],
    }))
  }, [criteria.propertyCategory, criteria.propertyType, listings])

  const handleSearchChange = (text: string) => {
    // Additive: update only location, keep active filters intact
    updateCriteria({ location: text })
  }

  const handlePropertyPress = (propertyId: string, price?: number, position?: number) => {
    behaviorTracker.trackClick(propertyId, {
      listing_type: 'SALE',
      price,
      position,
      source_page: 'buy',
    })
    router.push(`/listing/${propertyId}`)
  }

  const handleFiltersChange = (filters: FilterValues) => {
    // Replace filter criteria but preserve currently typed location
    search({
      location: criteria.location,
      propertyCategory: filters.propertyCategory,
      propertyType: filters.propertyType,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minArea: filters.minArea,
      maxArea: filters.maxArea,
      dynamicAttributes: filters.dynamicAttributes,
      sortBy: filters.sortBy,
    })
  }

  const doToggleFavorite = (propertyId: string) => {
    toggleBookmark(propertyId)
  }

  const handleFavoritePress = (propertyId: string, price: number, position: number) => {
    behaviorTracker.trackBookmark(propertyId, 'add', {
      listing_type: 'SALE',
      price,
      position,
      source_page: 'buy',
    })
    const property = propertyCardData.find((p) => p.id === propertyId)
    if (property?.isFavorite) {
      setPendingId(propertyId)
    } else {
      doToggleFavorite(propertyId)
    }
  }

  const renderHeader = (
    <View className='px-4 pt-2'>
      <ConfirmDialog
        visible={pendingId !== null}
        title='Xóa khỏi yêu thích'
        message='Bạn có muốn xóa tin đăng này khỏi danh sách yêu thích không?'
        confirmLabel='Xóa'
        cancelLabel='Hủy'
        onConfirm={() => {
          if (pendingId) doToggleFavorite(pendingId)
          setPendingId(null)
        }}
        onCancel={() => setPendingId(null)}
      />
      {/* Error State */}
      {error && (
        <View className='py-10 items-center px-4'>
          <Text className='font-jakarta-medium text-red-500 text-center mb-2'>
            Đã xảy ra lỗi khi tải dữ liệu.
          </Text>
          <Text className='text-gray-400 text-center text-xs mb-4'>{error.message}</Text>
        </View>
      )}

      {propertyCardData.length > 0 ? (
        <View>
          <View className='mt-3 mb-3 flex-row items-center justify-between'>
            <Text className='font-jakarta-bold text-xl text-main-black'>Bất động sản phù hợp</Text>
          </View>
        </View>
      ) : null}
      <RecommendedListings />
    </View>
  )

  // Use a footer component for the maps button so it scrolls with content
  const renderFooter = () => (
    <View className='px-4 pb-6'>
      {isFetchingNextPage && (
        <View className='py-4 items-center'>
          <ActivityIndicator size='small' color='#7065F0' />
        </View>
      )}
    </View>
  )

  const renderEmpty = () =>
    !isLoading && !error ? (
      <View className='py-10 items-center px-4'>
        <Text className='font-jakarta-medium text-gray-500 text-base'>
          Không tìm thấy bất động sản nào.
        </Text>
      </View>
    ) : null

  return (
    <SafeAreaView className='flex-1 bg-white' edges={[]}>
      <Box className='px-4 pt-1 pb-2'>
        {/* Search Bar + Toggle Button Row */}
        <View className='flex-row items-center gap-3'>
          <View className='flex-1'>
            <RealVistaPropertySearchBar
              value={criteria.location}
              onChangeText={handleSearchChange}
              onFiltersChange={handleFiltersChange}
              placeholder='Tìm kiếm theo địa điểm'
              showLeaseTerm={false}
              maxPriceLimit={10_000_000_000}
            />
          </View>
          <TouchableOpacity
            onPress={() => setIsMapView((prev) => !prev)}
            className='h-10 w-10 items-center justify-center rounded-lg border border-purple-92 bg-white'
            activeOpacity={0.7}
          >
            <IconLucide
              name={isMapView ? 'List' : 'Map'}
              color={isMapView ? '#100A55' : '#7065F0'}
              size={18}
            />
          </TouchableOpacity>
        </View>
      </Box>
      {/* List View with API data only */}
      {isMapView ? (
        <RealVistaMapSearchView
          properties={markers}
          totalCount={totalCount}
          isLoading={isMapLoading}
          onRegionChange={onRegionChange}
          onPropertyPress={handlePropertyPress}
          variant='buy'
        />
      ) : isLoading && propertyCardData.length === 0 ? (
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size='large' color='#7065F0' />
        </View>
      ) : (
        <FlatList
          data={propertyCardData}
          renderItem={({ item, index }) => (
            <View className='px-4 mb-6'>
              <RealVistaPropertyHorizontalCard
                property={item}
                onClick={() => handlePropertyPress(item.id, item.price, index)}
                onToggleFavorite={() => handleFavoritePress(item.id, item.price, index)}
                variant='buy'
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          onEndReached={nextPage}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  )
}
