import { useListingSearch } from '@/features/search/use-listing-search'
import { Box } from '@/shared/ui/box'
import { resolveListingCategoryLabel } from '@/shared/lib/resolve-listing-category-label'
import {
  RealVistaPropertyHorizontalCard,
  RealVistaRecommendedPropertyCard,
  type RealVistaPropertyCardData,
} from '@/shared/ui/realvista-property-listing-card'
import {
  RealVistaPropertySearchBar,
  type FilterValues,
} from '@/shared/ui/realvista-property-listing-search-bar'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useToggleBookmark } from '@/features/bookmark'
import { useMapSearch } from '@/features/map-search/api'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { RealVistaMapSearchView } from '@/shared/ui/realvista-map-search-view'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

const MOCK_RECOMMENDED_PROPERTIES: RealVistaPropertyCardData[] = [
  {
    id: 'recommended-rent-1',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200',
    title: 'Woodland Apartments',
    address: 'Quận Bình Thạnh, TP.HCM',
    categoryLabel: 'Apartment',
    price: 15_000_000,
    beds: 2,
    bathrooms: 2,
    area: 74,
    areaUnit: 'm²',
    isFavorite: false,
  },
  {
    id: 'recommended-rent-2',
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200',
    title: 'Oakleaf Cottage',
    address: 'Quận 3, TP.HCM',
    categoryLabel: 'House',
    price: 9_000_000,
    beds: 1,
    bathrooms: 1,
    area: 46,
    areaUnit: 'm²',
    isFavorite: true,
  },
  {
    id: 'recommended-rent-3',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200',
    title: 'BlissView Villa',
    address: 'Quận 2, TP.HCM',
    categoryLabel: 'Villa',
    price: 28_000_000,
    beds: 3,
    bathrooms: 3,
    area: 130,
    areaUnit: 'm²',
    isFavorite: false,
  },
]

function getListingAddress(listing: {
  street_address?: string
  full_address?: string
  location?: string
}): string {
  return (
    listing.street_address || listing.full_address || listing.location || 'Đang cập nhật địa chỉ'
  )
}

export function RentPage() {
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
    listingType: 'RENT',
  })
  const {
    markers,
    totalCount,
    isLoading: isMapLoading,
    onRegionChange,
  } = useMapSearch({
    listingType: 'RENT',
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
      description: '',
    }))
  }, [criteria.propertyCategory, criteria.propertyType, listings])

  const handleSearchChange = (text: string) => {
    updateCriteria({ location: text })
  }

  const handleFiltersChange = (filters: FilterValues) => {
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

  const handlePropertyPress = (propertyId: string) => {
    router.push(`/listing/${propertyId}`)
  }

  const doToggleFavorite = (propertyId: string) => {
    toggleBookmark(propertyId)
  }

  const handleFavoritePress = (propertyId: string) => {
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

      <View className='mb-6'>
        <View className='mb-3 flex-row items-center justify-between'>
          <Text className='font-jakarta-bold text-lg text-main-black'>Gợi ý cho bạn</Text>
        </View>

        <FlatList
          horizontal
          data={MOCK_RECOMMENDED_PROPERTIES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <View style={{ width: 250 }}>
              <RealVistaRecommendedPropertyCard
                property={item}
                onClick={() => handlePropertyPress(item.id)}
                variant='rent'
              />
            </View>
          )}
        />
      </View>

      {propertyCardData.length > 0 ? (
        <View>
          <View className='mb-3 flex-row items-center justify-between'>
            <Text className='font-jakarta-bold text-lg text-main-black'>Bất động sản phù hợp</Text>
          </View>
        </View>
      ) : null}
    </View>
  )

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
              showLeaseTerm={true}
              maxPriceLimit={100_000_000}
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
          variant='rent'
        />
      ) : isLoading && propertyCardData.length === 0 ? (
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size='large' color='#7065F0' />
        </View>
      ) : (
        <FlatList
          data={propertyCardData}
          renderItem={({ item }) => (
            <View className='px-4 mb-6'>
              <RealVistaPropertyHorizontalCard
                property={item}
                onClick={() => handlePropertyPress(item.id)}
                onToggleFavorite={() => handleFavoritePress(item.id)}
                variant='rent'
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
