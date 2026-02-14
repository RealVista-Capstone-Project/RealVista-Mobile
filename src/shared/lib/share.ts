import { Alert, Share } from 'react-native'
import { File, Paths } from 'expo-file-system'

import type { Listing } from '@/entities/listing'
import { APP_CONFIG } from '@/shared/constants/app'
import { formatVND } from './format-currency'

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

/**
 * Check if expo-sharing native module is available
 * Returns false in Expo Go or if native module isn't built
 */
async function isSharingAvailable(): Promise<boolean> {
  try {
    const Sharing = require('expo-sharing')
    return await Sharing.isAvailableAsync()
  } catch {
    return false
  }
}

/**
 * Share image file using expo-sharing (requires development build)
 */
async function shareImage(imageUrl: string): Promise<boolean> {
  if (!(await isSharingAvailable())) {
    return false
  }

  try {
    const Sharing = require('expo-sharing')
    const destination = new File(Paths.cache, 'share-image.jpg')
    const downloadedFile = await File.downloadFileAsync(imageUrl, destination, {
      idempotent: true,
    })

    if (downloadedFile.exists) {
      await Sharing.shareAsync(downloadedFile.uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Chia sẻ bất động sản',
      })
      return true
    }
  } catch {
    // Silently fail - will fall back to text-only sharing
  }

  return false
}

export async function shareListing({ listing }: ShareListingOptions): Promise<void> {
  const shareUrl = generateListingShareUrl(listing)
  const price = formatVND(listing.price)
  const address = listing.property?.street_address || 'N/A'

  const shareMessage = `${listing.name}\n${price}\n${address}\n\nXem chi tiết: ${shareUrl}`

  // Get primary image for sharing
  const primaryMedia = listing.media?.find((m) => m.is_primary) || listing.media?.[0]
  const imageUrl = primaryMedia?.media_url

  try {
    // Try to share image first (only works in development builds)
    if (imageUrl) {
      await shareImage(imageUrl)
    }

    // Always share the text message with URL using built-in Share API
    await Share.share({
      message: shareMessage,
      title: listing.name,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi xảy ra'
    Alert.alert('Lỗi chia sẻ', errorMessage)
  }
}
