import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Box } from '@/shared/ui/box'
import { Heading } from '@/shared/ui/heading'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { Text } from '@/shared/ui/text'

export function ExplorePage() {
  return (
    <SafeAreaView className='flex-1 bg-gray-950' edges={['top']}>
      <ScrollView className='flex-1'>
        <Box className='p-4'>
          {/* Header */}
          <Box className='mb-6 items-center'>
            <IconSymbol size={64} name='paperplane.fill' color='#6366f1' />
            <Heading size='3xl' className='text-center text-white'>
              Explore
            </Heading>
            <Text size='lg' className='mt-2 text-center text-gray-400'>
              Discover what&apos;s possible
            </Text>
          </Box>

          {/* Feature Cards */}
          <Box className='gap-4'>
            <FeatureCard
              icon='chevron.left.forwardslash.chevron.right'
              title='File-Based Routing'
              description='Navigate through app/(tabs)/index.tsx and app/(tabs)/explore.tsx'
              color='#6366f1'
            />
            <FeatureCard
              icon='device.mobile'
              title='Cross-Platform'
              description='Built for Android, iOS, and web with React Native'
              color='#8b5cf6'
            />
            <FeatureCard
              icon='paintbrush'
              title='NativeWind Styling'
              description='Modern utility-first CSS framework for React Native'
              color='#ec4899'
            />
            <FeatureCard
              icon='sparkles'
              title='Gluestack UI'
              description='Accessible, customizable, and themeable UI component library'
              color='#14b8a6'
            />
            <FeatureCard
              icon='cube'
              title='Feature-Sliced Design'
              description='Organized architecture with shared, entities, features, and widgets'
              color='#f59e0b'
            />
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string
  title: string
  description: string
  color: string
}) {
  return (
    <Box className='rounded-xl bg-gray-900 p-4 shadow-md'>
      <Box className='flex-row items-center gap-3'>
        <Box
          className='h-12 w-12 items-center justify-center rounded-full'
          style={{ backgroundColor: color + '20' }}
        >
          <IconSymbol size={24} name={icon as any} color={color} />
        </Box>
        <Box className='flex-1'>
          <Text size='md' bold className='mb-1 text-white'>
            {title}
          </Text>
          <Text size='sm' className='text-gray-400'>
            {description}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
