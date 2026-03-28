import type { RealVistaPropertyCardData } from '@/shared/ui/realvista-property-listing-card'
import { resolveListingCategoryLabel } from '@/shared/lib/resolve-listing-category-label'

import type { RecommendedListingDTO } from '../model/types'

/** Cùng thứ tự với danh sách mua/thuê (RealVistaPropertyHorizontalCard). */
function addressFromListing(listing: RecommendedListingDTO): string {
  return (
    listing.street_address || listing.full_address || listing.location || 'Đang cập nhật địa chỉ'
  )
}

export function mapRecommendedListingToPropertyCard(
  listing: RecommendedListingDTO
): RealVistaPropertyCardData {
  const beds =
    listing.attributes?.find((a) => a.attribute_code === 'BEDROOMS')?.value_number ??
    listing.bedrooms ??
    0
  const bathrooms =
    listing.attributes?.find((a) => a.attribute_code === 'BATHROOMS')?.value_number ??
    listing.bathrooms ??
    0

  const boosted =
    (listing as { is_boosted?: boolean }).is_boosted ?? (listing as { boosted?: boolean }).boosted

  return {
    id: listing.listing_id,
    image: listing.thumbnail || 'https://via.placeholder.com/800',
    title: listing.name,
    address: addressFromListing(listing),
    categoryLabel: resolveListingCategoryLabel({ title: listing.name }),
    price: typeof listing.price === 'number' ? listing.price : Number(listing.price),
    beds,
    bathrooms,
    area: listing.area,
    areaUnit: 'm²',
    isPopular: Boolean(boosted),
    isFavorite: listing.is_favorite ?? false,
    status: listing.status,
    attributes: listing.attributes ?? [],
  }
}
