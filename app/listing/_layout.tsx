import { Box } from '@/shared/ui/box'
import { ApplyAppBar } from '@/widgets/apply-appbar'
import { Tabs, useRouter } from 'expo-router'
import { View } from 'react-native'

export default function ListingLayout() {
  const router = useRouter()

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
        price='$2,700'
        buttonLabel='Đăng ký ngay'
        onPress={() => console.log('Đăng ký ngay pressed')}
      />
    </Box>
  )
}
