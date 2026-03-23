import { useListingSearch } from '@/features/search/use-listing-search'
import { useMapSearch } from '@/features/map-search/api'
import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { OpenMapsButton } from '@/shared/ui/open-maps-button'
import { RealVistaMapSearchView } from '@/shared/ui/realvista-map-search-view'
import {
  RealVistaPropertyCard,
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
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

export function RentPage() {
  const router = useRouter()
  const [searchMode, setSearchMode] = useState<'list' | 'map'>('list')
  const [pendingId, setPendingId] = useState<string | null>(null)
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

  // Map search — fetch markers from API when in map mode
  const {
    markers: mapMarkers,
    totalCount: mapTotalCount,
    isLoading: mapIsLoading,
    onRegionChange,
  } = useMapSearch({
    listingType: 'RENT',
    enabled: searchMode === 'map',
  })

  // Map API listings to UI card data
  const propertyCardData: RealVistaPropertyCardData[] = useMemo(() => {
    return listings.map((listing) => ({
      id: listing.listing_id,
      image: listing.thumbnail || 'https://via.placeholder.com/800',
      title: listing.name,
      address: listing.location,
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
  }, [listings])

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

  const toggleSearchMode = () => {
    setSearchMode((prev) => (prev === 'list' ? 'map' : 'list'))
  }

  const handleOpenMaps = () => {
    console.log('Open maps pressed')
    // TODO: Navigate to map view
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
          <Text className="font-['PlusJakartaSans_500Medium'] text-red-500 text-center mb-2">
            Đã xảy ra lỗi khi tải dữ liệu.
          </Text>
          <Text className='text-gray-400 text-center text-xs mb-4'>{error.message}</Text>
        </View>
      )}
    </View>
  )

  const renderFooter = () => (
    <View className='px-4 pb-6'>
      {isFetchingNextPage && (
        <View className='py-4 items-center'>
          <ActivityIndicator size='small' color='#7065F0' />
        </View>
      )}
      {/* Open Maps Button */}
      {!isLoading && <OpenMapsButton onPress={handleOpenMaps} className='mt-6' />}
    </View>
  )

  const renderEmpty = () =>
    !isLoading && !error ? (
      <View className='py-10 items-center px-4'>
        <Text className="font-['PlusJakartaSans_500Medium'] text-gray-500 text-base">
          Không tìm thấy bất động sản nào.
        </Text>
      </View>
    ) : null

  return (
    <SafeAreaView className='flex-1 bg-white' edges={[]}>
      <Box className='px-4 pt-3 pb-2'>
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

          {/* Search Mode Toggle Button */}
          <TouchableOpacity
            onPress={toggleSearchMode}
            activeOpacity={0.7}
            className='h-10 w-10 items-center justify-center rounded-lg border-[1.5px] border-purple-92 bg-white'
          >
            <IconLucide
              name={searchMode === 'list' ? 'Map' : 'LayoutGrid'}
              color='#100A55'
              size={20}
            />
          </TouchableOpacity>
        </View>
      </Box>

      {searchMode === 'list' ? (
        /* List View with API data */
        isLoading && propertyCardData.length === 0 ? (
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size='large' color='#7065F0' />
          </View>
        ) : (
          <FlatList
            data={propertyCardData}
            renderItem={({ item }) => (
              <View className='px-4 mb-6'>
                <RealVistaPropertyCard
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
        )
      ) : (
        /* Map View */
        <RealVistaMapSearchView
          properties={mapMarkers}
          totalCount={mapTotalCount}
          isLoading={mapIsLoading}
          onRegionChange={onRegionChange}
          onPropertyPress={handlePropertyPress}
          propertyCountLabel={`${mapTotalCount} bất động sản cho thuê`}
          variant='rent'
        />
      )}
    </SafeAreaView>
  )
}
