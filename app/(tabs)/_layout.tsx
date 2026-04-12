import { Tabs } from 'expo-router'
import React from 'react'

import { useNotificationWebSocket } from '@/features/notifications'
import { Box } from '@/shared/ui/box'
import { HapticTab } from '@/shared/ui/haptic-tab'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { MobileHeader } from '@/widgets/mobile-header'

export default function TabLayout() {
  useNotificationWebSocket()

  return (
    <Tabs
      initialRouteName='explore'
      screenOptions={{
        headerShown: true,
        header: () => <MobileHeader />,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 70,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIconStyle: {
          marginTop: 10,
        },
        tabBarActiveTintColor: '#7065F0',
        tabBarInactiveTintColor: '#9EA3AE',
      }}
    >
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color }) => (
            <Box className='items-center justify-center'>
              <IconSymbol size={25} name='explore' color={color} />
            </Box>
          ),
        }}
      />
      <Tabs.Screen
        name='manage-posts'
        options={{
          title: 'Bài đăng',
          tabBarIcon: ({ color }) => (
            <Box className='items-center justify-center'>
              <IconSymbol size={25} name='dashboard' color={color} />
            </Box>
          ),
        }}
      />
      <Tabs.Screen
        name='chat'
        options={{
          title: 'Trò chuyện',
          tabBarIcon: ({ color }) => (
            <Box className='items-center justify-center'>
              <IconSymbol size={25} name='message' color={color} />
            </Box>
          ),
        }}
      />
      <Tabs.Screen
        name='favorite'
        options={{
          title: 'Yêu thích',
          tabBarIcon: ({ color }) => (
            <Box className='items-center justify-center'>
              <IconSymbol size={25} name='heart' color={color} />
            </Box>
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color }) => (
            <Box className='items-center justify-center'>
              <IconSymbol size={25} name='person' color={color} />
            </Box>
          ),
        }}
      />
    </Tabs>
  )
}
