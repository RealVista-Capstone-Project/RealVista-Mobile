import { useState } from 'react'
import { Image, TouchableOpacity } from 'react-native'

import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'

interface PropertyImageCarouselProps {
  images: string[]
}

export function PropertyImageCarousel({ images }: PropertyImageCarouselProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  return (
    <Box className='mb-6'>
      {/* Main Image with overlay button */}
      <Box className='relative mb-3 rounded-2xl overflow-hidden'>
        <Image
          source={{ uri: images[activeImageIndex] }}
          style={{ width: '100%', height: 220 }}
          className='rounded-2xl'
          resizeMode='cover'
        />
        <TouchableOpacity
          className='absolute bottom-4 right-4 flex-row items-center bg-white/90 px-5 py-3 rounded-xl shadow-lg'
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
          onPress={() => {
            /* TODO: handle view all photos */
          }}
        >
          <IconLucide size={20} name='Image' color='#7065f0' />
          <Text bold className='ml-2 text-lg text-main-black'>
            Xem ảnh
          </Text>
        </TouchableOpacity>
      </Box>
      {/* Thumbnails below main image */}
      <Box className='flex-row gap-3'>
        {images.slice(0, 2).map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setActiveImageIndex(index)}
            className={`flex-1 rounded-xl border-2 ${
              activeImageIndex === index ? 'border-purple-500' : 'border-transparent'
            }`}
            style={{ overflow: 'hidden' }}
          >
            <Image
              source={{ uri: image }}
              style={{ width: '100%', height: 100 }}
              className='rounded-xl'
              resizeMode='cover'
            />
          </TouchableOpacity>
        ))}
      </Box>
    </Box>
  )
}
