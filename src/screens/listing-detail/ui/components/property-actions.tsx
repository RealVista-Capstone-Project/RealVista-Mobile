import { useState } from 'react'
import { Alert, TouchableOpacity } from 'react-native'
import { Heart } from 'lucide-react-native'

import type { Listing } from '@/entities/listing'
import { shareListing } from '@/shared/lib/share'
import { Box } from '@/shared/ui/box'
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
  const [isSharing, setIsSharing] = useState(false)

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
      Alert.alert(
        'Xóa khỏi yêu thích',
        'Bạn có muốn xóa tin đăng này khỏi danh sách yêu thích không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: onToggleFavorite },
        ]
      )
    } else {
      onToggleFavorite?.()
    }
  }

  return (
    <Box className='mb-4 flex-row gap-4'>
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
        <Heart size={20} color='#7065f0' fill={isFavorite ? '#7065f0' : 'none'} strokeWidth={2} />
        <Text bold className='text-main-primary'>
          {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
        </Text>
      </TouchableOpacity>
    </Box>
  )
}
