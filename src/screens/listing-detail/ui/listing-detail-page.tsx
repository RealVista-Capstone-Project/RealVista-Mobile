import { useState } from 'react'
import { Image, ScrollView, TouchableOpacity } from 'react-native'

import { DatePicker } from '@/shared/ui/bna/date-picker'
import { Box } from '@/shared/ui/box'
import { Divider } from '@/shared/ui/divider'
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

        {/* Specifications Card */}
        <Box className='mb-6 rounded-lg border border-[#F0EFFB]  bg-white p-6'>
          {/* First Row: Sqft, Bed, Bath, Status */}
          <Box className='mb-6 flex-row justify-between'>
            {/* Bed */}
            <Box className='w-20'>
              <Text className='mb-4 text-[#000929]/50' size='sm'>
                Bed
              </Text>
              <Box className='flex-row items-center gap-2'>
                <IconLucide size={20} name='BedDouble' color='#808494' />
                <Text size='lg' bold className='text-[#000929]'>
                  {property.beds}
                </Text>
              </Box>
            </Box>

            {/* Bath */}
            <Box className='w-20'>
              <Text className='mb-4 text-[#000929]/50' size='sm'>
                Bath
              </Text>
              <Box className='flex-row items-center gap-2'>
                <IconLucide size={20} name='Bath' color='#808494' />
                <Text size='lg' bold className='text-[#000929]'>
                  {property.baths}
                </Text>
              </Box>
            </Box>
            {/* Square Area */}
            <Box className='w-24'>
              <Text className='mb-4 text-[#000929]/50' size='sm'>
                Sqft
              </Text>
              <Box className='flex-row items-center gap-2'>
                <IconLucide size={20} name='Layers2' color='#808494' />
                <Text size='lg' bold className='text-[#000929]'>
                  6x7.5 m²
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Second Row: Repair Quality */}
          <Box className='flex-row gap-5'>
            <Box className='w-36'>
              <Text className='mb-4 text-[#000929]/50' size='sm'>
                Repair Quality
              </Text>
              <Box className='flex-row items-center gap-2'>
                <IconLucide size={20} name='Wrench' color='#808494' />
                <Text size='lg' bold className='text-[#000929]'>
                  Modern Loft
                </Text>
              </Box>
            </Box>
            {/* Status */}
            <Box className='w-28'>
              <Text className='mb-4 text-[#000929]/50' size='sm'>
                Status
              </Text>
              <Box className='flex-row items-center gap-2'>
                <IconLucide size={20} name='CircleCheck' color='#808494' />
                <Text size='lg' bold className='text-[#000929]'>
                  Active
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* About this home */}
        <Box className='mb-8'>
          <Text size='xl' bold className='mb-4 text-[#000929]'>
            About this home
          </Text>
          <Text className='mb-2 text-[#6c727f]'>
            Check out that Custom Backyard Entertaining space! 3237sqft, 4 Bedrooms, 2 Bathrooms
            house on a Lake .
          </Text>
          <Text bold className='text-[#7065f0]'>
            Read more
          </Text>
        </Box>

        {/* Property Owner Card */}
        <Box className='mb-6 rounded-lg border border-purple-92 bg-purple-98 p-6'>
          <Text className='mb-6 text-[#000929]/50' size='sm'>
            Listed by property owner
          </Text>

          <Box>
            {/* Owner Info */}
            <Box className='flex-row gap-4'>
              <Image
                source={{ uri: property.agent.avatar }}
                className='h-14 w-14 rounded-full'
                style={{ width: 56, height: 56, borderRadius: 28 }}
              />
              <Box className='justify-center'>
                <Text bold className='text-[#000929]'>
                  {property.agent.name}
                </Text>
                <Text className='mt-1 text-[#000929]/50' size='sm'>
                  Rich Capital Properties LLC
                </Text>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box className='gap-2 pt-4'>
              <TouchableOpacity className='mb-3 rounded-lg bg-purple-94 px-6 py-3'>
                <Text bold className='text-center text-brand-primary'>
                  Ask a question
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className='flex-row items-center justify-center gap-2 rounded-lg bg-purple-94 px-6 py-3'>
                <IconLucide size={20} name='Info' color='#7065f0' />
                <Text bold className='text-brand-primary'>
                  Get more info
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>

        {/* Request a Home Tour Card */}
        <Box className='mb-6 rounded-lg border border-purple-92 bg-white p-6'>
          <Text size='lg' bold className='mb-6 text-main-black'>
            Request a home tour
          </Text>

          {/* Date Picker */}
          <DatePicker label='Select Date' placeholder='Choose a date' />

          {/* Request Button */}
          <TouchableOpacity className='my-4 flex-row items-center justify-center gap-2 rounded-lg bg-main-secondary px-8 py-4'>
            <IconLucide size={24} name='MapPin' color='#fff' />
            <Text bold className='text-white'>
              Request tour
            </Text>
          </TouchableOpacity>

          <Text className='text-center text-[#6c727f]' size='xs'>
            It&apos;s free, with no obligation - cancel anytime.
          </Text>
        </Box>

        <Divider className='my-6' />

        {/* Rental Features */}
        <Box className='mb-8'>
          <Text size='xl' bold className='mb-8 text-main-black'>
            Rental features
          </Text>

          <Box className='gap-5 text-base'>
            {/* Listed on */}
            <Box className='flex-row items-center justify-between'>
              <Box className='flex-row items-center gap-2'>
                <Text className='text-main-black/50'>Listed on</Text>
                <Box className='flex-row items-center gap-2'>
                  <Text bold className='text-[#0e0854]'>
                    Estatery
                  </Text>
                  <IconLucide size={16} name='CircleCheck' color='#7065f0' />
                </Box>
              </Box>
              <Text bold className='text-main-black'>
                1 week
              </Text>
            </Box>

            {/* Date available */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Date available</Text>
              <Text bold className='text-main-black'>
                Available now
              </Text>
            </Box>

            {/* Type */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Type</Text>
              <Text bold className='text-main-black'>
                Home
              </Text>
            </Box>

            {/* Laundry */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Laundry</Text>
              <Text bold className='text-main-black'>
                In unit
              </Text>
            </Box>

            {/* Cooling */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Cooling</Text>
              <Text bold className='text-main-black'>
                Air Conditioner
              </Text>
            </Box>

            {/* Heating */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Heating</Text>
              <Text bold className='text-main-black'>
                Forced Air
              </Text>
            </Box>

            {/* City */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>City</Text>
              <Text bold className='text-main-black'>
                Miami
              </Text>
            </Box>

            {/* Size */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Size</Text>
              <Text bold className='text-main-black'>
                2,173 sqft
              </Text>
            </Box>

            {/* Lot Size */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Lot Size</Text>
              <Text bold className='text-main-black'>
                9,060 sqft
              </Text>
            </Box>

            {/* Parking Area */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Parking Area</Text>
              <Text bold className='text-main-black'>
                Yes
              </Text>
            </Box>

            {/* Deposit & Fees */}
            <Box className='flex-row items-center justify-between'>
              <Text className='text-main-black/50'>Deposit & Fees</Text>
              <Text bold className='text-main-black'>
                $2,700
              </Text>
            </Box>
          </Box>
        </Box>

        <Divider className='my-6' />
        {/* Rent Price History */}
        <Box className='mb-8'>
          <Text bold className='mb-8 text-main-black text-xl'>
            Rent Price History for St. Crystal
          </Text>

          <Box className='rounded-lg border border-purple-96 bg-white p-6 text-base'>
            {/* Timeline Entry 1 - Most Recent */}
            <Box className='mb-6'>
              <Box className='mb-2 flex-row items-center justify-between'>
                <Text className='text-gray-500' size='sm'>
                  28/12/2021
                </Text>
                <Text bold className='text-main-black'>
                  $2,700/mo
                </Text>
              </Box>
              <Text bold className='mb-2 text-main-black'>
                Listed for Sale
              </Text>
              <Text className='text-brand-primary' size='sm'>
                Estatery
              </Text>
            </Box>

            <Box className='mb-6 h-[1.5px] bg-purple-96' />

            {/* Timeline Entry 2 */}
            <Box className='mb-6'>
              <Box className='mb-2 flex-row items-center justify-between'>
                <Text className='text-gray-500' size='sm'>
                  10/10/2021
                </Text>
                <Text bold className='text-main-black'>
                  $2,600/mo
                </Text>
              </Box>
              <Text bold className='mb-2 text-main-black'>
                PriceChange
              </Text>
              <Text className='text-brand-primary' size='sm'>
                Estatery
              </Text>
            </Box>

            <Box className='mb-6 h-[1.5px] bg-purple-96' />

            {/* Timeline Entry 3 */}
            <Box className='mb-6'>
              <Box className='mb-2 flex-row items-center justify-between'>
                <Text className='text-gray-500' size='sm'>
                  03/04/2020
                </Text>
                <Text bold className='text-main-black'>
                  $2,000/mo
                </Text>
              </Box>
              <Text bold className='mb-2 text-main-black'>
                Rented
              </Text>
              <Text className='text-brand-primary' size='sm'>
                Public Records
              </Text>
            </Box>

            <Box className='mb-6 h-[1.5px] bg-purple-96' />

            {/* Timeline Entry 4 */}
            <Box className='mb-6'>
              <Box className='mb-2 flex-row items-center justify-between'>
                <Text className='text-gray-500' size='sm'>
                  25/11/2019
                </Text>
                <Text bold className='text-main-black'>
                  $1,900/mo
                </Text>
              </Box>
              <Text bold className='mb-2 text-main-black'>
                Black Friday
              </Text>
              <Text className='text-brand-primary' size='sm'>
                Public Records
              </Text>
            </Box>

            <Box className='mb-6 h-[1.5px] bg-purple-96' />

            {/* Timeline Entry 5 - Oldest */}
            <Box>
              <Box className='mb-2 flex-row items-center justify-between'>
                <Text className='text-gray-500' size='sm'>
                  09/02/2019
                </Text>
                <Text bold className='text-main-black'>
                  $1,800/mo
                </Text>
              </Box>
              <Text bold className='mb-2 text-main-black'>
                Listed for Sale
              </Text>
              <Text className='text-brand-primary' size='sm'>
                Public Records
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Legal Disclaimer */}
        <Text className='mt-8 text-gray-500 text-left' size='sm' style={{ lineHeight: 20 }}>
          You agree to Estatery&apos;s Terms of Use & Privacy Policy. By choosing to contact a
          property, you also agree that Estatery Group, landlords, and property managers may call or
          text you about any inquiries you submit through our services, which may involve use of
          automated means and prerecorded/artificial voices. You don&apos;t need to consent as a
          condition of renting any property, or buying any other goods or services. Message/data
          rates may apply.
        </Text>
      </ScrollView>
    </Box>
  )
}
