import { useListingSearch } from '@/features/search/use-listing-search'
import { Box } from '@/shared/ui/box'
import { OpenMapsButton } from '@/shared/ui/open-maps-button'
import {
  RealVistaPropertyCard,
  type RealVistaPropertyCardData,
} from '@/shared/ui/realvista-property-listing-card'
import {
  RealVistaPropertySearchBar,
  type FilterValues,
} from '@/shared/ui/realvista-property-listing-search-bar'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function RentPage() {
  const router = useRouter()
  const { listings, isLoading, isFetchingNextPage, error, search, criteria, nextPage } =
    useListingSearch({
      listingType: 'RENT',
    })

  // Debug logs
  console.log('RentPage Render:', {
    isLoading,
    isFetchingNextPage,
    error: error?.message,
    listingsCount: listings.length,
    criteria,
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
      description: '', // Description not available in search response
    }))
  }, [listings])

  const handleSearchChange = (text: string) => {
    search({ location: text })
  }

  const handleFiltersChange = (filters: FilterValues) => {
    search({
      propertyCategory: filters.propertyCategory,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      dynamicAttributes: filters.dynamicAttributes,
      // Rental period logic to be implemented on backend/API side if needed
    })
  }

  const handlePropertyPress = (propertyId: string) => {
    router.push(`/listing/${propertyId}`)
  }

  const handleOpenMaps = () => {
    // Navigate to map view (implementation pending)
    console.log('Open maps pressed')
  }

  const renderHeader = useMemo(
    () => (
      <View className='px-4 py-6'>
        {/* Search Bar */}
        <RealVistaPropertySearchBar
          value={criteria.location}
          onChangeText={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          placeholder='Tìm kiếm theo địa điểm'
          className='mb-6'
          showLeaseTerm={true}
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
    ),
    [criteria.location, error]
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
    <SafeAreaView className='flex-1 bg-white' edges={['top']}>
      {isLoading && propertyCardData.length === 0 ? (
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
                // Favorite logic to be implemented with store
                onToggleFavorite={() => {}}
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
