import React from 'react'
import { Modal, ScrollView, TouchableOpacity, Image } from 'react-native'
import { TenantApplication } from '@/entities/tenant-application/model/types'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { Button, ButtonText, ButtonIcon } from '@/shared/ui/button'
import { useAuthStore } from '@/entities/user'

interface Props {
  application: TenantApplication | null
  visible: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

export const ApplicationDetailModal = ({ application, visible, onClose, onDelete }: Props) => {
  const { user } = useAuthStore()

  if (!application) return null

  const getInitials = (name?: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US'
  }

  const userName = user?.fullName || 'Nguyễn Văn A'
  const userInitials = getInitials(userName)

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <Box className='flex-1 bg-gray-50'>
        <Box className='flex-row items-center justify-between p-4 bg-white border-b border-gray-100'>
          <Text className='text-lg font-bold text-gray-900'>Chi tiết đơn</Text>
          <TouchableOpacity onPress={onClose} className='p-2'>
            <IconSymbol name='xmark' size={24} color='#6b7280' />
          </TouchableOpacity>
        </Box>

        <ScrollView
          className='flex-1'
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info */}
          <Box className='p-6 items-center border-b border-gray-100 bg-white'>
            <Box
              className='h-24 w-24 rounded-full bg-indigo-100 items-center justify-center mb-4 border-4 border-white'
              style={{
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <Text className='text-2xl font-bold text-indigo-600'>{userInitials}</Text>
            </Box>
            <Text className='text-lg font-bold text-gray-900 text-center'>{userName}</Text>
            <Text className='text-sm text-gray-500 mt-1 text-center'>TP. Hồ Chí Minh</Text>

            <Box className='mt-4 w-full'>
              <Button variant='outline' size='sm' className='w-full bg-white border-gray-200'>
                <ButtonIcon
                  as={() => <IconSymbol name='arrow.down.doc.fill' size={16} color='#4b5563' />}
                />
                <ButtonText className='text-gray-700 ml-2'>Xuất PDF</ButtonText>
              </Button>
            </Box>
          </Box>

          <Box className='p-6'>
            {/* Tax ID Mock */}
            <Box
              className='bg-indigo-50 rounded-xl p-4 flex-row justify-between items-center mb-6'
              style={{ borderWidth: 1, borderColor: '#e0e7ff' }}
            >
              <Box className='flex-row items-center flex-1'>
                <Box className='bg-indigo-100 p-2 rounded-lg mr-3'>
                  <IconSymbol name='doc.text.fill' size={20} color='#4f46e5' />
                </Box>
                <Box>
                  <Text className='text-[10px] text-indigo-400 font-bold uppercase tracking-wider'>
                    Mã số thuế
                  </Text>
                  <Text className='font-bold text-indigo-900 text-sm tracking-widest mt-0.5'>
                    0301 •• ••••
                  </Text>
                </Box>
              </Box>
              <Button variant='link' size='sm' className='px-2'>
                <ButtonText className='text-xs text-indigo-600 font-bold'>Hiện</ButtonText>
              </Button>
            </Box>

            {/* General Info */}
            <Box className='mb-6'>
              <Box className='flex-row justify-between items-center py-3 border-b border-gray-100 border-dashed'>
                <Text className='text-gray-500 text-sm'>Ngày sinh</Text>
                <Text className='font-medium text-gray-900 text-sm'>05/09/1995</Text>
              </Box>
              <Box className='flex-row justify-between items-center py-3 border-b border-gray-100 border-dashed'>
                <Text className='text-gray-500 text-sm'>Tuổi</Text>
                <Text className='font-medium text-gray-900 text-sm'>29 tuổi</Text>
              </Box>
              <Box className='flex-row justify-between items-center py-3 border-b border-gray-100 border-dashed'>
                <Text className='text-gray-500 text-sm'>Email</Text>
                <Text className='font-medium text-gray-900 text-sm' numberOfLines={1}>
                  {user?.email || 'nguyenvana@gmail.com'}
                </Text>
              </Box>
              <Box className='flex-row justify-between items-center py-3 border-b border-gray-100 border-dashed'>
                <Text className='text-gray-500 text-sm'>Số điện thoại</Text>
                <Text className='font-medium text-gray-900 text-sm'>0909 123 456</Text>
              </Box>
            </Box>

            {/* Financial & Lease Info */}
            <Box
              className='bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-6 flex-row flex-wrap justify-between'
              style={{
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
              }}
            >
              <Box className='w-[48%] mb-6'>
                <Text className='text-xs text-gray-400 mb-1'>Thu nhập</Text>
                <Text className='font-bold text-gray-900 text-sm'>
                  {application.monthlyIncome
                    ? `${application.monthlyIncome.toLocaleString('vi-VN')} VNĐ/th`
                    : 'N/A'}
                </Text>
              </Box>
              <Box className='w-[48%] mb-6'>
                <Text className='text-xs text-gray-400 mb-1'>Tỷ lệ chi trả</Text>
                <Text className='font-bold text-gray-900 text-sm'>30%</Text>
              </Box>
              <Box className='w-[48%]'>
                <Text className='text-xs text-gray-400 mb-1'>Số người</Text>
                <Text className='font-bold text-gray-900 text-sm'>2 người</Text>
              </Box>
              <Box className='w-[48%]'>
                <Text className='text-xs text-gray-400 mb-1'>Ngày chuyển</Text>
                <Text className='font-bold text-gray-900 text-sm'>
                  {application.moveInDate
                    ? new Date(application.moveInDate).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </Text>
              </Box>
            </Box>

            {/* Reference */}
            <Box className='mb-6'>
              <Text className='font-bold text-xs text-gray-900 uppercase tracking-wider mb-3 ml-1'>
                Người tham chiếu
              </Text>
              <Box
                className='bg-white border border-gray-100 p-4 rounded-xl'
                style={{
                  elevation: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                }}
              >
                <Box className='bg-gray-50 p-3 rounded-lg mb-4'>
                  <Text className='text-sm italic text-gray-500'>
                    &quot;Anh ấy luôn trả tiền thuê nhà đúng hạn&quot;
                  </Text>
                </Box>
                <Box className='flex-row items-center gap-3 w-full'>
                  <Box className='h-10 w-10 bg-orange-100 rounded-full items-center justify-center mr-3'>
                    <Text className='font-bold text-orange-600'>TB</Text>
                  </Box>
                  <Box className='flex-1'>
                    <Box className='flex-row items-center w-full mb-1'>
                      <Text className='text-sm font-bold text-gray-900 mr-2'>Trần Văn B</Text>
                      <Box className='bg-green-500 px-1.5 py-0.5 rounded-full'>
                        <Text className='text-[9px] font-bold text-white uppercase tracking-wider'>
                          Đã xác minh
                        </Text>
                      </Box>
                    </Box>
                    <Text className='text-xs text-gray-400'>tranvanb@gmail.com</Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {application.note && (
              <Box className='mb-6'>
                <Text className='font-bold text-xs text-gray-900 uppercase tracking-wider mb-2 ml-1'>
                  Ghi chú
                </Text>
                <Box className='bg-white border border-gray-100 p-4 rounded-xl'>
                  <Text className='text-sm text-gray-700'>{application.note}</Text>
                </Box>
              </Box>
            )}

            <Box className='mt-2'>
              <Button
                variant='solid'
                action='negative'
                className='w-full h-12 rounded-xl bg-red-50'
                onPress={() => {
                  onClose()
                  onDelete(application.tenantApplicationId)
                }}
              >
                <ButtonText className='text-red-500 font-bold'>Xóa đơn đăng ký</ButtonText>
              </Button>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </Modal>
  )
}
