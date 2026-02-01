import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import LogoApp from 'assets/images/logo.svg'

export function PropertyFeatures() {
  return (
    <Box className='mb-8'>
      <Text size='xl' bold className='mb-8 text-main-black'>
        Tính năng cho thuê
      </Text>

      <Box className='gap-5 text-base'>
        {/* Listed on */}
        <Box className='flex-row items-center justify-between'>
          <Box className='flex-row items-center gap-2'>
            <Text className='text-main-black/50'>Đăng lên</Text>
            <Box className='flex-row items-center gap-2'>
              <LogoApp width={20} height={20} />
              <Text bold className='text-[#0e0854]'>
                Real Vista
              </Text>
            </Box>
          </Box>
          <Text bold className='text-main-black'>
            1 tuần
          </Text>
        </Box>

        {/* Date available */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Ngày có sẵn</Text>
          <Text bold className='text-main-black'>
            Có sẵn ngay
          </Text>
        </Box>

        {/* Type */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Loại</Text>
          <Text bold className='text-main-black'>
            Nhà
          </Text>
        </Box>

        {/* Laundry */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Giặt ủi</Text>
          <Text bold className='text-main-black'>
            Trong căn hộ
          </Text>
        </Box>

        {/* Cooling */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Làm mát</Text>
          <Text bold className='text-main-black'>
            Điều hòa
          </Text>
        </Box>

        {/* Heating */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Sưởi</Text>
          <Text bold className='text-main-black'>
            Điều hòa
          </Text>
        </Box>

        {/* City */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Thành phố</Text>
          <Text bold className='text-main-black'>
            Miami
          </Text>
        </Box>

        {/* Size */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Diện tích</Text>
          <Text bold className='text-main-black'>
            2,173 sqft
          </Text>
        </Box>

        {/* Lot Size */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Diện tích đất</Text>
          <Text bold className='text-main-black'>
            9,060 sqft
          </Text>
        </Box>

        {/* Parking Area */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Chỗ đậu xe</Text>
          <Text bold className='text-main-black'>
            Có
          </Text>
        </Box>

        {/* Deposit & Fees */}
        <Box className='flex-row items-center justify-between'>
          <Text className='text-main-black/50'>Tiền đặt cọc & Phí</Text>
          <Text bold className='text-main-black'>
            $2,700
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
