import { Tabs } from 'expo-router'
import React from 'react'

import { Box } from '@/shared/ui/box'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { Text } from '@/shared/ui/text'
import { HapticTab } from '@/shared/ui/haptic-tab'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Box className='items-center justify-center'>
              <IconSymbol size={28} name='house.fill' color={color} />
              <Text
                size='xs'
                className={focused ? 'text-indigo-500' : 'text-gray-400'}
                style={{ marginTop: 4 }}
              >
                Home
              </Text>
            </Box>
          ),
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Box className='items-center justify-center'>
              <IconSymbol size={28} name='paperplane.fill' color={color} />
              <Text
                size='xs'
                className={focused ? 'text-indigo-500' : 'text-gray-400'}
                style={{ marginTop: 4 }}
              >
                Explore
              </Text>
            </Box>
          ),
        }}
      />
    </Tabs>
  )
}
