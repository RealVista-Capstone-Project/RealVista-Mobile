import type { Listing } from '@/entities/listing'
import { APP_CONFIG } from '@/shared/constants/app'
import { Alert, Platform } from 'react-native'

/**
 * Generate SEO-friendly listing URL
 * Pattern: {domain}/vi/{listing_type}/{slug}.i{listing_id}
 */
export function generateListingShareUrl(listing: Listing): string {
  const listingType = listing.listing_type.toLowerCase() // 'rent' or 'sale'
  const slug = listing.slug
  const listingId = listing.listing_id

  return `${APP_CONFIG.WEB_URL}/${APP_CONFIG.DEFAULT_LOCALE}/${listingType}/${slug}.i${listingId}`
}

interface ShareListingOptions {
  listing: Listing
}

export async function shareListing({ listing }: ShareListingOptions): Promise<void> {
  // react-native-share requires native modules — not available in Expo Go
  if (Platform.OS === 'web') {
    Alert.alert('Không hỗ trợ', 'Tính năng chia sẻ không khả dụng trên Web.')
    return
  }

  const shareUrl = generateListingShareUrl(listing)

  try {
    // Lazy-load to avoid TurboModuleRegistry crash when native module is not linked (Expo Go)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNShare = require('react-native-share').default
    await RNShare.open({ url: shareUrl })
  } catch (error: unknown) {
    // User cancelled share — react-native-share throws on dismiss
    if (error instanceof Error && error.message?.includes('User did not share')) {
      return
    }
    // Handle case where native module is not available (Expo Go)
    if (error instanceof Error && error.message?.includes('could not be found')) {
      Alert.alert('Không hỗ trợ', 'Tính năng chia sẻ chỉ khả dụng trên ứng dụng đã build.')
      return
    }
    const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi xảy ra'
    Alert.alert('Lỗi chia sẻ', errorMessage)
  }
}
