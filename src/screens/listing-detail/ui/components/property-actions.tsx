import { TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'

export function PropertyActions() {
  const router = useRouter()

  return (
    <Box className='mb-4 flex-row gap-4'>
      <TouchableOpacity className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border-2 border-purple-92 px-6 py-3 bg-purple-98'>
        <IconLucide size={20} name='Share2' color='#7065f0' />
        <Text bold className='text-main-primary'>
          Chia sẻ
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border-2 border-purple-92 px-6 py-3 bg-purple-98'>
        <IconLucide size={20} name='Heart' color='#7065f0' />
        <Text bold className='text-main-primary'>
          Yêu thích
        </Text>
      </TouchableOpacity>
      {/* TEST: Notification Button */}
      <TouchableOpacity
        onPress={() => router.push('/notification-test')}
        className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border-2 border-purple-92 px-6 py-3 bg-purple-98'
      >
        <IconLucide size={20} name='Bell' color='#7065f0' />
        <Text bold className='text-main-primary'>
          Test
        </Text>
      </TouchableOpacity>
    </Box>
  )
}
