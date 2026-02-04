import { useListingDetail } from '@/features/get-listing-detail'
import { Box } from '@/shared/ui/box'
import { ApplyAppBar } from '@/widgets/apply-appbar'
import { formatVND } from '@/shared/lib/format-currency'
import { Tabs } from 'expo-router'
import { View } from 'react-native'

export default function ListingLayout() {
  const { data: listing } = useListingDetail()

  // Format price for display (in VND)
  const formattedPrice = listing ? formatVND(listing.price) : '2.7 triệu'

  return (
    <Box className='flex-1'>
      <View
        className='flex-1'
        style={{
          paddingBottom: 100,
        }}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name='index' options={{ href: null }} />
        </Tabs>
      </View>

      <ApplyAppBar
        price={formattedPrice}
        listingType={listing?.listing_type}
        buttonLabel='Đăng ký ngay'
        onPress={() => console.log('Đăng ký ngay pressed')}
      />
    </Box>
  )
}
