import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Heart } from 'lucide-react-native'
import { Href, useRouter } from 'expo-router'

import type { Listing } from '@/entities/listing'
import { shareListing } from '@/shared/lib/share'
import { Box } from '@/shared/ui/box'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'

interface PropertyActionsProps {
  listing: Listing
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function PropertyActions({
  listing,
  isFavorite = false,
  onToggleFavorite,
}: PropertyActionsProps) {
  const router = useRouter()
  const [isSharing, setIsSharing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleShare = async () => {
    if (isSharing) return
    setIsSharing(true)
    try {
      await shareListing({ listing })
    } finally {
      setIsSharing(false)
    }
  }

  const handleFavoritePress = () => {
    if (isFavorite) {
      setShowConfirm(true)
    } else {
      onToggleFavorite?.()
    }
  }

  return (
    <Box className='mb-4 flex-row gap-4'>
      <ConfirmDialog
        visible={showConfirm}
        title='Xóa khỏi yêu thích'
        message='Bạn có muốn xóa tin đăng này khỏi danh sách yêu thích không?'
        confirmLabel='Xóa'
        cancelLabel='Hủy'
        onConfirm={() => {
          setShowConfirm(false)
          onToggleFavorite?.()
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <TouchableOpacity
        className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border-2 border-purple-92 px-6 py-3 bg-purple-98'
        onPress={handleShare}
        disabled={isSharing}
      >
        <IconLucide size={20} name='Share2' color='#7065f0' />
        <Text bold className='text-main-primary'>
          Chia sẻ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border-2 border-purple-92 px-6 py-3 bg-purple-98'
        onPress={handleFavoritePress}
      >
        <Heart
          size={20}
          color={isFavorite ? 'red' : '#7065f0'}
          fill={isFavorite ? 'red' : 'none'}
          strokeWidth={2}
        />
        <Text bold className='text-main-primary'>
          {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
        </Text>
      </TouchableOpacity>
      {/* TEST: Notification Button */}
      <TouchableOpacity
        onPress={() => router.push('/notification-test' as Href)}
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
