import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import LogoApp from 'assets/images/logo.svg'

export function PropertyFeatures() {
  return (
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
              <LogoApp width={20} height={20} />
              <Text bold className='text-[#0e0854]'>
                Estatery
              </Text>
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
  )
}
