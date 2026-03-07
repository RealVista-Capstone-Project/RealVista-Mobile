import { useListingDetail } from '@/features/get-listing-detail'
import { DEFAULT_LISTING_PRICE } from '@/shared/constants'
import { formatVND } from '@/shared/lib/format-currency'
import { Box } from '@/shared/ui/box'
import { ApplyAppBar } from '@/widgets/apply-appbar'
import { type ReactNode } from 'react'

interface ListingLayoutContainerProps {
  children: ReactNode
}

/**
 * Container component for Listing layout
 * Handles data fetching and provides the ApplyAppBar with pricing
 *
 * This component follows the container/presentational pattern:
 * - Container: Fetches data, handles business logic (this file)
 * - Layout: Handles routing structure (_layout.tsx)
 */
export function ListingLayoutContainer({ children }: ListingLayoutContainerProps) {
  const { data: listing } = useListingDetail()

  // Format price for display (in VND)
  const formattedPrice = listing ? formatVND(listing.price) : formatVND(DEFAULT_LISTING_PRICE)

  return (
    <Box className='flex-1'>
      {/* Main content area with bottom padding for app bar */}
      <Box
        className='flex-1'
        style={{
          paddingBottom: 100,
        }}
      >
        {children}
      </Box>

      {/* Apply App Bar - fixed at bottom */}
      <ApplyAppBar
        price={formattedPrice}
        listingType={listing?.listing_type}
        buttonLabel='Đăng ký ngay'
        onPress={() => console.log('Đăng ký ngay pressed')}
      />
    </Box>
  )
}
