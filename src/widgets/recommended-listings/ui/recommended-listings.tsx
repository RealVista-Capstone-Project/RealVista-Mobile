/**
 * RecommendedListings Widget
 * Displays AI-powered personalized listing recommendations
 * Only renders for authenticated users with available recommendations
 */

import { type RecommendedListingDTO } from '@/entities/recommendation'
import { useRecommendations } from '@/features/get-recommendations'
import { behaviorTracker } from '@/shared/lib/analytics'
import { formatVND } from '@/shared/lib/format-currency'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { router } from 'expo-router'
import { RefreshCw, Sparkles } from 'lucide-react-native'
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from 'react-native'

interface RecommendationCardProps {
  item: RecommendedListingDTO
  onPress: (item: RecommendedListingDTO) => void
}

function RecommendationCard({ item, onPress }: RecommendationCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.9}
      style={{
        width: 260,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#F0EFFB',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* Thumbnail */}
      <View style={{ aspectRatio: 16 / 10, width: '100%' }}>
        <Image
          source={{ uri: item.thumbnail }}
          style={{
            width: '100%',
            height: '100%',
            borderTopLeftRadius: 6.5,
            borderTopRightRadius: 6.5,
          }}
          resizeMode='cover'
        />
        {/* Score Badge */}
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#7065F0',
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 11,
              fontFamily: 'PlusJakartaSans_700Bold',
            }}
          >
            {Math.round(item.score * 100)}% match
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 18,
            lineHeight: 26,
            letterSpacing: -0.5,
            color: '#7065F0',
            marginBottom: 4,
          }}
        >
          {formatVND(item.price)}
        </Text>

        <Text
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 16,
            lineHeight: 24,
            color: '#000929',
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text
          style={{
            fontFamily: 'PlusJakartaSans_500Medium',
            fontSize: 13,
            lineHeight: 18,
            color: '#6C727F',
            marginBottom: 8,
          }}
          numberOfLines={1}
        >
          {item.location}
        </Text>

        {/* Reason */}
        <View
          style={{
            backgroundColor: '#F7F7FD',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 12,
              lineHeight: 16,
              color: '#7065F0',
            }}
            numberOfLines={2}
          >
            {item.reason}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export function RecommendedListings() {
  const { recommendations, behaviorSummary, isLoading, refresh } = useRecommendations(6)

  const handleListingPress = (item: RecommendedListingDTO) => {
    // Track click
    behaviorTracker.trackClick(item.listing_id, {
      listing_type: item.listing_type as 'RENT' | 'SALE',
      price: item.price,
      source_page: 'home',
    })

    // Navigate to listing detail
    router.push(`/listing/${item.listing_id}`)
  }

  // Don't render if no recommendations
  if (!isLoading && recommendations.length === 0) {
    return null
  }

  return (
    <Box className='bg-purple-98 py-8 my-4'>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} color='#7065F0' />
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 20,
              lineHeight: 30,
              letterSpacing: -0.5,
              color: '#000929',
            }}
          >
            Gợi ý cho bạn
          </Text>
        </View>

        <TouchableOpacity
          onPress={refresh}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: '#E0DEF7',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <RefreshCw size={16} color='#7065F0' />
        </TouchableOpacity>
      </View>

      {/* Behavior Summary */}
      {behaviorSummary && (
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_500Medium',
            fontSize: 14,
            lineHeight: 20,
            color: '#6C727F',
            paddingHorizontal: 24,
            marginBottom: 12,
          }}
        >
          {behaviorSummary}
        </Text>
      )}

      {/* Content */}
      {isLoading ? (
        <Box className='items-center justify-center py-8'>
          <ActivityIndicator size='small' color='#7065F0' />
        </Box>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingHorizontal: 24 }}
        >
          {recommendations.map((item) => (
            <RecommendationCard key={item.listing_id} item={item} onPress={handleListingPress} />
          ))}
        </ScrollView>
      )}
    </Box>
  )
}
