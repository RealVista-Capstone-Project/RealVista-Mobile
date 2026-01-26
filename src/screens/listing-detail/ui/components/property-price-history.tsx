import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'

export function PropertyPriceHistory() {
  return (
    <Box className='mb-8'>
      <Text bold className='mb-8 text-main-black text-xl'>
        Lịch sử giá thuê tại St. Crystal
      </Text>

      <Box className='rounded-lg border border-purple-96 bg-white p-6 text-base'>
        {/* Timeline Entry 1 - Most Recent */}
        <Box className='mb-6'>
          <Box className='mb-2 flex-row items-center justify-between'>
            <Text className='text-gray-500' size='sm'>
              28/12/2021
            </Text>
            <Text bold className='text-main-black'>
              $2,700/tháng
            </Text>
          </Box>
          <Text bold className='mb-2 text-main-black'>
            Niêm yết bán
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
              $2,600/tháng
            </Text>
          </Box>
          <Text bold className='mb-2 text-main-black'>
            Thay đổi giá
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
              $2,000/tháng
            </Text>
          </Box>
          <Text bold className='mb-2 text-main-black'>
            Đã cho thuê
          </Text>
          <Text className='text-brand-primary' size='sm'>
            Hồ sơ công khai
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
              $1,900/tháng
            </Text>
          </Box>
          <Text bold className='mb-2 text-main-black'>
            Black Friday
          </Text>
          <Text className='text-brand-primary' size='sm'>
            Hồ sơ công khai
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
              $1,800/tháng
            </Text>
          </Box>
          <Text bold className='mb-2 text-main-black'>
            Niêm yết bán
          </Text>
          <Text className='text-brand-primary' size='sm'>
            Hồ sơ công khai
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
