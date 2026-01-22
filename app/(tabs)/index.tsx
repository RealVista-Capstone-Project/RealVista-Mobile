import { Button, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { HomePage } from '@/screens/home'
import { RoleGuard } from '@/shared/lib/auth/role-guard'
import { Box } from '@/shared/ui/box'
import { Heading } from '@/shared/ui/heading'
import { Text } from '@/shared/ui/text'
import { AppHeader } from '@/widgets/app-header'
import { SidebarDrawer } from '@/widgets/sidebar-drawer'

import { useLogout } from '@/features/auth'

export default function HomeScreen() {
  const { mutate: logout } = useLogout()

  return (
    <SafeAreaView className='flex-1 bg-gray-950' edges={['top']}>
      <AppHeader />
      <SidebarDrawer />
      <ScrollView className='flex-1 bg-gray-950'>
        <Box className='p-4'>
          {/* Welcome Section */}
          <Box className='mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-6 shadow-lg'>
            <Heading size='2xl' className='mb-2 text-white'>
              Welcome Back!
            </Heading>
            <Text size='md' className='text-gray-100'>
              Discover amazing features in your app
            </Text>
          </Box>

          <RoleGuard allowedRoles={['ADMIN']} fallback={null}>
            <Box className='mb-6 rounded-2xl bg-red-900 p-6 shadow-lg'>
              <Heading size='xl' className='text-white'>
                Admin Zone
              </Heading>
              <Text className='text-gray-200'>Only admins can see this!</Text>
            </Box>
          </RoleGuard>

          {/* Home Page Content */}
          <HomePage />

          <Box className='mt-8 mb-8'>
            <Button title='Logout' color='#ef4444' onPress={() => logout()} />
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  )
}
