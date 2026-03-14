import { Image, TouchableOpacity } from 'react-native'

import type { Agent, Listing } from '@/entities/listing'
import { useAuth } from '@/features/auth'
import { useChatStore } from '@/features/chat'
import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'
import { useRouter } from 'expo-router'

interface PropertyOwnerProps {
  agent: Agent
  listing: Listing
}

export function PropertyOwner({ agent, listing }: PropertyOwnerProps) {
  const { isAuthenticated } = useAuth()
  const openModal = useChatStore((s) => s.openModal)
  const router = useRouter()

  const handleContact = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login')
      return
    }
    openModal(listing)
  }

  return (
    <Box className='mb-6 rounded-lg border border-purple-92 bg-purple-98 p-6'>
      <Text className='mb-6 text-main-black/50' size='sm'>
        Liệt kê bởi chủ sở hữu bất động sản
      </Text>

      <Box>
        {/* Owner Info */}
        <Box className='flex-row gap-4'>
          <Image
            source={{ uri: agent.avatar_url }}
            className='h-14 w-14 rounded-full'
            style={{ width: 56, height: 56, borderRadius: 28 }}
          />
          <Box className='justify-center'>
            <Text bold className='text-main-black'>
              {agent.full_name}
            </Text>
            <Text className='mt-1 text-main-black/50' size='sm'>
              {agent.company}
            </Text>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box className='gap-2 pt-4'>
          <TouchableOpacity
            className='mb-3 rounded-lg bg-purple-94 px-6 py-3'
            onPress={handleContact}
          >
            <Text bold className='text-center text-brand-primary'>
              Hỏi thêm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-row items-center justify-center gap-2 rounded-lg bg-purple-94 px-6 py-3'>
            <IconLucide size={20} name='Info' color='#7065f0' />
            <Text bold className='text-brand-primary'>
              Xem thêm thông tin
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  )
}
