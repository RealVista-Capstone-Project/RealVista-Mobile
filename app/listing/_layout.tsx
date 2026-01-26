import { ApplyAppBar } from '@/shared/ui'
import { Box } from '@/shared/ui/box'
import { Tabs } from 'expo-router'
import { View } from 'react-native'

export default function ListingLayout() {
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
        buttonLabel='Apply Now'
        onPress={() => console.log('Apply Now pressed')}
      />
    </Box>
  )
}
