import { SidebarDrawer } from '@/widgets/sidebar-drawer'
import { TopNav } from '@/widgets/top-nav'
import { ReactNode } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface MainLayoutProps {
  children: ReactNode
  showHeader?: boolean
}

export function MainLayout({ children, showHeader = true }: MainLayoutProps) {
  return (
    <SafeAreaView className='flex-1 bg-gray-50' edges={['top', 'left', 'right']}>
      {/* Sidebar Drawer */}
      <SidebarDrawer />

      {/* App Header */}
      {showHeader && <TopNav />}

      {/* Main Content */}
      <View className='flex-1'>{children}</View>
    </SafeAreaView>
  )
}
