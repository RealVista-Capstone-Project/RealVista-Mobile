import type { Listing } from '@/entities/listing'
import { APP_CONFIG } from '@/shared/constants/app'
import { Alert } from 'react-native'
import RNShare from 'react-native-share'

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
  const shareUrl = generateListingShareUrl(listing)

  try {
    await RNShare.open({
      url: shareUrl,
    })
  } catch (error: unknown) {
    // User cancelled share - react-native-share throws on dismiss
    if (error instanceof Error && error.message?.includes('User did not share')) {
      return
    }
    const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi xảy ra'
    Alert.alert('Lỗi chia sẻ', errorMessage)
  }
}
