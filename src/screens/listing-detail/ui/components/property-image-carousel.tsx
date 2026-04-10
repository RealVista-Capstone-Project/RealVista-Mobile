import { useState } from 'react'
import { Dimensions, Image, Modal, Pressable, ScrollView, TouchableOpacity } from 'react-native'

import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'

interface PropertyImageCarouselProps {
  images: string[]
}

export function PropertyImageCarousel({ images }: PropertyImageCarouselProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const handleViewAllPhotos = () => {
    setIsGalleryOpen(true)
  }

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

  // Ensure we always have at least one item to avoid blank image
  const displayImages = images.length > 0 ? images : ['']

  return (
    <Box className='mb-4'>
      {/* Main Image with overlay button */}
      <Box className='relative mb-3 rounded-2xl overflow-hidden'>
        <Image
          source={{ uri: displayImages[activeImageIndex] }}
          style={{ width: '100%', height: 220 }}
          className='rounded-2xl'
          resizeMode='cover'
        />

        {/* View Photos button — bottom right */}
        <TouchableOpacity
          className='absolute bottom-4 right-4 flex-row items-center bg-white/90 px-5 py-3 rounded-xl shadow-lg'
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
          onPress={handleViewAllPhotos}
        >
          <IconLucide size={20} name='Image' color='#7065f0' />
          <Text bold className='ml-2 text-lg text-main-black'>
            Xem ảnh
          </Text>
        </TouchableOpacity>
      </Box>

      {/* Thumbnails below main image */}
      <Box className='flex-row gap-3'>
        {displayImages.slice(0, 2).map((image, index) => (
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

      {/* Image Gallery Modal */}
      <Modal
        visible={isGalleryOpen}
        animationType='fade'
        transparent={false}
        onRequestClose={() => setIsGalleryOpen(false)}
      >
        <Box className='flex-1 bg-black'>
          {/* Header */}
          <Box className='absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent'>
            <Text bold className='text-white text-lg'>
              Ảnh ({displayImages.length})
            </Text>
            <TouchableOpacity onPress={() => setIsGalleryOpen(false)}>
              <IconLucide size={24} name='X' color='#FFFFFF' />
            </TouchableOpacity>
          </Box>

          {/* Image Gallery */}
          <ScrollView
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ height: screenHeight }}
          >
            {displayImages.map((image, index) => (
              <Pressable
                key={index}
                style={{ width: screenWidth, height: screenHeight }}
                onPress={() => setIsGalleryOpen(false)}
              >
                <Image
                  source={{ uri: image }}
                  style={{ width: screenWidth, height: screenHeight }}
                  resizeMode='contain'
                />
              </Pressable>
            ))}
          </ScrollView>
        </Box>
      </Modal>
    </Box>
  )
}
