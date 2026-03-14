import { ScrollView, View } from 'react-native'

import {
  RealVistaPropertyCard,
  type RealVistaPropertyCardData,
} from '@/shared/ui/realvista-property-listing-card'
import { Text } from '@/shared/ui/text'

interface PropertySimilarListingsProps {
  listings: RealVistaPropertyCardData[]
  onToggleFavorite?: (id: string) => void
  onPropertyClick?: (id: string) => void
}

export function PropertySimilarListings({
  listings,
  onToggleFavorite,
  onPropertyClick,
}: PropertySimilarListingsProps) {
  if (!listings.length) {
    return null
  }

  return (
    <View className='bg-purple-98 py-12 my-6'>
      {/* Section Title */}
      <Text className='mb-6 px-6 font-jakarta-bold text-2xl leading-9 tracking-tight text-main-black'>
        Bất động sản tương tự
      </Text>

      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName='gap-4 px-4'
      >
        {listings.map((listing) => (
          <View key={listing.id} className='w-[327px]'>
            <RealVistaPropertyCard
              property={listing}
              onToggleFavorite={onToggleFavorite}
              onClick={onPropertyClick}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
