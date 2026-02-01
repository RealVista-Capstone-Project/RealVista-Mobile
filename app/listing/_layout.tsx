import { useListingDetail } from '@/features/get-listing-detail'
import { Box } from '@/shared/ui/box'
import { ApplyAppBar } from '@/widgets/apply-appbar'
import { Tabs } from 'expo-router'
import { View } from 'react-native'

export default function ListingLayout() {
  const { data: listing } = useListingDetail()
  console.log('listing', listing)

  // Format price for display (assuming monthly rent)
  const formattedPrice = listing ? `$${listing.price.toLocaleString()}` : '$2,700'

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
        buttonLabel='Đăng ký ngay'
        onPress={() => console.log('Đăng ký ngay pressed')}
      />
    </Box>
  )
}
