import { useState } from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

import { Box } from '@/shared/ui/box'
import { Heading } from '@/shared/ui/heading'
import { ChevronLeftIcon, Icon } from '@/shared/ui/icon'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { Text } from '@/shared/ui/text'

interface Property {
  id: string
  title: string
  price: string
  location: string
  beds: number
  baths: number
  sqft: number
  description: string
  images: string[]
  agent: {
    name: string
    avatar: string
    rating: number
    reviews: number
  }
}

const mockProperty: Property = {
  id: '1',
  title: 'Luxury Family Home with Modern Amenities',
  price: '$1,250,000',
  location: '123 Oak Street, Beverly Hills, CA 90210',
  beds: 4,
  baths: 3,
  sqft: 2800,
  description:
    'Experience luxury living in this stunning 4-bedroom, 3-bathroom home featuring modern amenities throughout. The open-concept living area boasts high ceilings, hardwood floors, and abundant natural light. The gourmet kitchen includes top-of-the-line appliances, custom cabinetry, and a spacious island perfect for entertaining.\n\nAdditional features include a home office, media room, and a beautifully landscaped backyard with a pool and outdoor kitchen. Located in an exclusive neighborhood with top-rated schools and easy access to shopping, dining, and entertainment.',
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
  ],
  agent: {
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 4.9,
    reviews: 128,
  },
}

export function ListingDetailPage() {
  const [property] = useState<Property>(mockProperty)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  return (
    <Box className='flex-1 bg-white p-6'>
      {/* Header - Back to Map Button */}
      <Box className='flex-row items-center justify-between border-b border-gray-100 bg-white pb-4'>
        <TouchableOpacity className='flex-row items-center gap-1'>
          <Icon as={ChevronLeftIcon} className='w-4 h-4 text-[#7065f0]' />
          <Text size='lg' bold className='text-[#7065f0]'>
            Back to map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <IconSymbol size={24} name='square.and.arrow.up' color='#9ca3af' />
        </TouchableOpacity>
      </Box>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Property Name */}
        <Box className='gap-2 pb-4'>
          <Text size='4xl' bold className='text-[#000929] tracking-tighter'>
            Beverly Springfield
          </Text>
          <Text className='text-[#000929]/50'>2821 Lake Sevilla, Palm Harbor, TX</Text>
        </Box>

        {/* Action Buttons */}
        <Box className='mb-4 flex-row gap-4'>
          <TouchableOpacity className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border-2 border-[#E0DEF7] px-6 py-3'>
            <IconLucide size={20} name='Share2' color='#7065f0' />
            <Text bold className='text-[#7065f0]'>
              Share
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border-2 border-[#E0DEF7] px-6 py-3'>
            <IconLucide size={20} name='Heart' color='#7065f0' />
            <Text bold className='text-[#7065f0]'>
              Favorite
            </Text>
          </TouchableOpacity>
        </Box>
        {/* Image Carousel with Featured Image and Thumbnails */}
        <Box className='mb-6'>
          {/* Main Image with overlay button */}
          <Box className='relative mb-3 rounded-2xl overflow-hidden'>
            <Image
              source={{ uri: property.images[activeImageIndex] }}
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
              <IconSymbol size={24} name='photo.on.rectangle' color='#7065f0' />
              <Text bold className='ml-2 text-lg text-[#2d2d2d]'>
                View all photos
              </Text>
            </TouchableOpacity>
          </Box>
          {/* Thumbnails below main image */}
          <Box className='flex-row gap-3'>
            {property.images.slice(0, 2).map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveImageIndex(index)}
                className={`flex-1 rounded-xl border-2 ${activeImageIndex === index ? 'border-purple-500' : 'border-transparent'}`}
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

        {/* Property Info */}
        <Box className='pt-4'>
          <Text size='3xl' bold className='mb-2 text-gray-900'>
            {property.price}
          </Text>
          <Heading size='lg' className='mb-2 text-gray-900'>
            {property.title}
          </Heading>
          <Box className='mb-4 flex-row items-center gap-2'>
            <IconSymbol size={16} name='location.fill' color='#ef4444' />
            <Text size='sm' className='flex-1 text-gray-600'>
              {property.location}
            </Text>
          </Box>

          {/* Property Details */}
          <Box className='mb-6 flex-row justify-between rounded-xl border border-gray-200 bg-gray-50 p-4'>
            <Box className='items-center'>
              <IconSymbol size={24} name='bed.double.fill' color='#3b82f6' />
              <Text size='lg' bold className='mt-1 text-gray-900'>
                {property.beds}
              </Text>
              <Text size='xs' className='text-gray-500'>
                Beds
              </Text>
            </Box>
            <Box className='items-center'>
              <IconSymbol size={24} name='drop.fill' color='#3b82f6' />
              <Text size='lg' bold className='mt-1 text-gray-900'>
                {property.baths}
              </Text>
              <Text size='xs' className='text-gray-500'>
                Baths
              </Text>
            </Box>
            <Box className='items-center'>
              <IconSymbol size={24} name='square.fill' color='#3b82f6' />
              <Text size='lg' bold className='mt-1 text-gray-900'>
                {property.sqft}
              </Text>
              <Text size='xs' className='text-gray-500'>
                Sqft
              </Text>
            </Box>
          </Box>

          {/* Description */}
          <Box className='mb-6'>
            <Heading size='md' className='mb-3 text-gray-900'>
              Description
            </Heading>
            <Text size='sm' className='leading-relaxed text-gray-600'>
              {property.description}
            </Text>
          </Box>

          {/* Agent Info */}
          <Box className='mb-4'>
            <Heading size='md' className='mb-3 text-gray-900'>
              Agent
            </Heading>
            <Box className='flex-row items-center rounded-xl border border-gray-200 bg-gray-50 p-4'>
              <Image source={{ uri: property.agent.avatar }} style={styles.avatar} />
              <Box className='ml-3 flex-1'>
                <Text size='md' bold className='text-gray-900'>
                  {property.agent.name}
                </Text>
                <Box className='mt-1 flex-row items-center gap-1'>
                  <IconSymbol size={14} name='star.fill' color='#fbbf24' />
                  <Text size='sm' className='text-gray-600'>
                    {property.agent.rating} ({property.agent.reviews} reviews)
                  </Text>
                </Box>
              </Box>
              <TouchableOpacity className='ml-3 rounded-full bg-blue-500 px-4 py-2'>
                <Text size='sm' bold className='text-white'>
                  Contact
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
      </ScrollView>

      {/* Bottom Action Bar */}
      <Box className='border-t border-gray-200 bg-white p-4 pb-8'>
        <Box className='flex-row gap-3'>
          <TouchableOpacity className='flex-1 flex-row items-center justify-center rounded-xl bg-blue-500 py-3'>
            <IconSymbol size={20} name='phone.fill' color='#fff' />
            <Text size='md' bold className='ml-2 text-white'>
              Call
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 flex-row items-center justify-center rounded-xl border-2 border-blue-500 py-3'>
            <IconSymbol size={20} name='message.fill' color='#3b82f6' />
            <Text size='md' bold className='ml-2 text-blue-500'>
              Message
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 flex-row items-center justify-center rounded-xl bg-green-500 py-3'>
            <IconSymbol size={20} name='calendar' color='#fff' />
            <Text size='md' bold className='ml-2 text-white'>
              Tour
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  )
}

const styles = StyleSheet.create({
  thumbnail: {
    height: 108,
    width: 163,
  },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
  },
})
