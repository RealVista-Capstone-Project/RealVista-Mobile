import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { useState } from 'react'
import { TouchableOpacity } from 'react-native'

interface PropertyAboutProps {
  description: string
}

export function PropertyAbout({ description }: PropertyAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Box className='mb-8'>
      <Text size='xl' bold className='mb-4 text-main-black'>
        Về ngôi nhà này
      </Text>
      <Text className='mb-2 text-gray-500' numberOfLines={isExpanded ? undefined : 3}>
        {description}
      </Text>
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
        <Text bold className='text-main-primary'>
          {isExpanded ? 'Thu gọn' : 'Đọc thêm'}
        </Text>
      </TouchableOpacity>
    </Box>
  )
}
