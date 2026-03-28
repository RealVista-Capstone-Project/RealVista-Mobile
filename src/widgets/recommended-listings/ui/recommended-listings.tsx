/**
 * RecommendedListings Widget
 * AI recommendations using RealVistaRecommendedPropertyCard (buy / rent)
 */

import {
  mapRecommendedListingToPropertyCard,
  type RecommendedListingDTO,
  recommendationKeys,
} from '@/entities/recommendation'
import { useAuthStore } from '@/entities/user'
import { useFavoriteUiSyncStore, useToggleBookmark } from '@/features/bookmark'
import { useRecommendations } from '@/features/get-recommendations'
import { behaviorTracker } from '@/shared/lib/analytics'
import { Box } from '@/shared/ui/box'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import {
  RealVistaRecommendedPropertyCard,
  type RealVistaPropertyCardData,
} from '@/shared/ui/realvista-property-listing-card'
import { Text } from '@/shared/ui/text'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { RefreshCw } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'

export type RecommendedListingsVariant = 'buy' | 'rent'

export interface RecommendedListingsProps {
  variant: RecommendedListingsVariant
  listingType: 'SALE' | 'RENT'
}

export function RecommendedListings({ variant, listingType }: RecommendedListingsProps) {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()
  const bookmarkSync = useFavoriteUiSyncStore((s) => s.bookmarkedByListingId)
  const { mutate: toggleBookmark } = useToggleBookmark()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const { recommendations, isLoading, isFetched, isError, refresh } = useRecommendations(
    6,
    listingType
  )

  const cards: RealVistaPropertyCardData[] = useMemo(
    () =>
      recommendations.map((r) => {
        const card = mapRecommendedListingToPropertyCard(r)
        const g = bookmarkSync[r.listing_id]
        return g !== undefined ? { ...card, isFavorite: g } : card
      }),
    [bookmarkSync, recommendations]
  )

  const isBuy = variant === 'buy'
  const sourcePage = isBuy ? 'buy' : 'rent'

  const handleListingPress = (item: RecommendedListingDTO, position: number) => {
    behaviorTracker.trackClick(item.listing_id, {
      listing_type: item.listing_type as 'RENT' | 'SALE',
      price: item.price,
      position,
      source_page: sourcePage,
    })
    router.push(`/listing/${item.listing_id}`)
  }

  const doToggleFavorite = (propertyId: string) => {
    toggleBookmark(propertyId, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: recommendationKeys.all })
      },
    })
  }

  const handleFavoritePress = (propertyId: string) => {
    const property = cards.find((p) => p.id === propertyId)
    if (property?.isFavorite) {
      setPendingId(propertyId)
    } else {
      doToggleFavorite(propertyId)
    }
  }

  /** Chỉ hiện khi đã đăng nhập, load xong, không lỗi và có ít nhất 1 tin gợi ý (đúng SALE/RENT). */
  const shouldHideWidget = useMemo(() => {
    if (!token) return true
    if (!isFetched || isLoading) return true
    if (isError) return true
    if (recommendations.length === 0) return true
    return false
  }, [token, isFetched, isLoading, isError, recommendations.length])

  if (shouldHideWidget) {
    return null
  }

  return (
    <Box className='mb-6'>
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

      {/* Header — cùng layout Buy & Thuê */}
      <View className='mb-3 flex-row items-center justify-between'>
        <Text className='font-jakarta-bold text-xl text-main-black'>Gợi ý cho bạn</Text>

        <TouchableOpacity
          onPress={refresh}
          activeOpacity={0.7}
          className='h-9 w-9 items-center justify-center rounded-full border border-purple-92 bg-white'
        >
          <RefreshCw size={16} color='#7065F0' />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={cards}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item, index }) => {
          const raw = recommendations[index]
          if (!raw) return null
          return (
            <View style={{ width: 250 }}>
              <RealVistaRecommendedPropertyCard
                property={item}
                onClick={() => handleListingPress(raw, index)}
                onToggleFavorite={() => handleFavoritePress(item.id)}
                variant={isBuy ? 'buy' : 'rent'}
              />
            </View>
          )
        }}
      />
    </Box>
  )
}
