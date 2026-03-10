import { addDays, addMinutes, format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native'

import { useAuth } from '@/features/auth'
import { BottomSheet } from '@/shared/ui/bna/bottom-sheet'
import { DatePicker } from '@/shared/ui/bna/date-picker'
import { Box } from '@/shared/ui/box'
import { Button, ButtonSpinner, ButtonText } from '@/shared/ui/button'
import { Text } from '@/shared/ui/text'
import { Toast, ToastTitle, useToast } from '@/shared/ui/toast'
import { useAvailableSlots, useBookTour } from '../api/use-book-tour'

interface BookTourBottomSheetProps {
  listingId: string
  isVisible: boolean
  onClose: () => void
}

export function BookTourBottomSheet({ listingId, isVisible, onClose }: BookTourBottomSheetProps) {
  const [date, setDate] = useState<Date | undefined>(() => {
    const now = new Date()
    return now.getHours() >= 17 ? addDays(now, 1) : now
  })

  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [step, setStep] = useState<'selection' | 'confirmation'>('selection')

  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const { mutate: bookTour, isPending: submitting } = useBookTour()

  // Reset state when sheet opens
  useEffect(() => {
    if (isVisible) {
      const now = new Date()
      setDate(now.getHours() >= 17 ? addDays(now, 1) : now)
      setSelectedStartTime(null)
      setSelectedDuration(null)
      setStep('selection')
    }
  }, [isVisible])

  // Reset selection when date changes
  useEffect(() => {
    if (date && isVisible) {
      setSelectedStartTime(null)
      setSelectedDuration(null)
    }
  }, [date, isVisible])

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : ''
  const { data: response, isLoading: loading } = useAvailableSlots(listingId, formattedDate)

  // Explicit type cast based on API schema we defined
  // Handle case where backend directly returns array or payload wrapping
  const slots: string[] = useMemo(() => {
    const rawSlots = response ? (response as any).payload?.data || response : []
    return Array.isArray(rawSlots) ? rawSlots : []
  }, [response])

  const availableSlots: string[] = useMemo(() => {
    const allSlots = slots.map((s: string) => s.substring(0, 5))
    if (!date) return allSlots

    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    if (!isToday) return allSlots

    const now = new Date()
    const currentHourMin = format(now, 'HH:mm')

    return allSlots.filter((slot) => slot > currentHourMin)
  }, [slots, date])

  const availableDurations = useMemo(() => {
    if (!selectedStartTime) return []

    const durations = [30]

    const isSlotAvailable = (timeStr: string) => availableSlots.includes(timeStr)
    const baseDate = new Date(`2000-01-01T${selectedStartTime}:00`)

    const nextSlot30 = format(addMinutes(baseDate, 30), 'HH:mm')
    if (isSlotAvailable(nextSlot30)) {
      durations.push(60)

      const nextSlot60 = format(addMinutes(baseDate, 60), 'HH:mm')
      if (isSlotAvailable(nextSlot60)) {
        durations.push(90)
      }
    }

    return durations
  }, [selectedStartTime, availableSlots])

  const handleReview = () => {
    if (!date || !selectedStartTime || !selectedDuration) return
    setStep('confirmation')
  }

  const handleBook = () => {
    if (!date || !selectedStartTime || !selectedDuration) return

    const formattedDateForBooking = format(date, 'yyyy-MM-dd')
    const slotsToBook: string[] = []
    const baseDate = new Date(`${formattedDateForBooking}T${selectedStartTime}:00`)

    slotsToBook.push(`${formattedDateForBooking}T${selectedStartTime}:00`)

    if (selectedDuration >= 60) {
      const nextSlot1 = format(addMinutes(baseDate, 30), 'HH:mm')
      slotsToBook.push(`${formattedDateForBooking}T${nextSlot1}:00`)
    }

    if (selectedDuration >= 90) {
      const nextSlot2 = format(addMinutes(baseDate, 60), 'HH:mm')
      slotsToBook.push(`${formattedDateForBooking}T${nextSlot2}:00`)
    }

    bookTour(
      {
        listing_id: listingId,
        selected_slots: slotsToBook,
        notes: '',
      },
      {
        onSuccess: () => {
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <Toast nativeID={id} action='success' variant='solid'>
                  <ToastTitle>Đặt lịch thành công!</ToastTitle>
                </Toast>
              )
            },
          })
          onClose()
        },
        onError: (error) => {
          console.error(error)
          toast.show({
            placement: 'top',
            render: ({ id }) => {
              return (
                <Toast nativeID={id} action='error' variant='solid'>
                  <ToastTitle>Có lỗi xảy ra</ToastTitle>
                </Toast>
              )
            },
          })
        },
      }
    )
  }

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    if (hours > 0) {
      return remainingMins > 0 ? `${hours} giờ ${remainingMins} phút` : `${hours} giờ`
    }
    return `${mins} phút`
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title='Lên lịch xem nhà'
      snapPoints={isAuthenticated ? [0.8, 0.95] : [0.4]}
    >
      {!isAuthenticated ? (
        <Box className='space-y-6 py-4'>
          <Box className='space-y-2 items-center'>
            <Text className='text-xl text-main-black' bold>
              Bạn chưa đăng nhập
            </Text>
            <Text className='text-center text-gray-500'>
              Vui lòng đăng nhập để có thể đặt lịch xem nhà và nhận được sự hỗ trợ tốt nhất.
            </Text>
          </Box>
          <Box className='space-y-3 pt-2'>
            <Button
              onPress={() => {
                onClose()
                router.push('/login')
              }}
              className='w-full bg-main-primary border-main-primary justify-center'
            >
              <ButtonText className='text-white text-center'>Đăng nhập</ButtonText>
            </Button>
            <Button
              onPress={onClose}
              variant='outline'
              className='w-full border-gray-200 justify-center'
            >
              <ButtonText className='text-gray-600 text-center'>Để sau</ButtonText>
            </Button>
          </Box>
        </Box>
      ) : step === 'selection' ? (
        <Box className='space-y-6 pb-8'>
          {/* Date Selection */}
          <Box className='space-y-2'>
            <Text bold className='text-gray-700'>
              Ngày chọn
            </Text>
            <DatePicker
              mode='date'
              value={date}
              onChange={(d) => setDate(d as Date)}
              minimumDate={new Date()}
              placeholder='Ngày chọn'
            />
          </Box>

          {/* Time Slot Selection */}
          <Box className='space-y-2'>
            <Text bold className='text-gray-700'>
              Giờ bắt đầu
            </Text>
            {loading ? (
              <Box className='py-6 items-center justify-center'>
                <ActivityIndicator color='#7065F0' />
                <Text className='text-gray-500 mt-2'>Đang tải khung giờ...</Text>
              </Box>
            ) : availableSlots.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className='pb-2'
                contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}
              >
                {availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => {
                      setSelectedStartTime(slot)
                      setSelectedDuration(null)
                    }}
                    className={`rounded-lg border px-4 py-2 ${
                      selectedStartTime === slot
                        ? 'border-main-primary bg-main-primary'
                        : 'border-purple-92 bg-white'
                    }`}
                  >
                    <Text
                      className={selectedStartTime === slot ? 'text-white' : 'text-main-black'}
                      bold={selectedStartTime === slot}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Box className='rounded-lg border border-purple-92 bg-white p-4 items-center'>
                <Text className='text-gray-500'>Không có khung giờ trống</Text>
              </Box>
            )}
          </Box>

          {/* Duration Selection */}
          {selectedStartTime && (
            <Box className='space-y-2'>
              <Text bold className='text-gray-700'>
                Thời lượng
              </Text>
              <Box className='flex-row flex-wrap gap-2'>
                {[30, 60, 90].map((duration) => {
                  const isAvailable = availableDurations.includes(duration)
                  const isSelected = selectedDuration === duration

                  return (
                    <TouchableOpacity
                      key={duration}
                      disabled={!isAvailable}
                      onPress={() => setSelectedDuration(duration)}
                      className={`flex-row items-center justify-center rounded-lg border px-4 py-3 min-w-[30%] ${
                        isSelected
                          ? 'border-main-primary bg-main-secondary/10'
                          : isAvailable
                            ? 'border-purple-92 bg-white'
                            : 'border-gray-100 bg-gray-50 opacity-50'
                      }`}
                    >
                      <Text
                        className={
                          isSelected
                            ? 'text-main-primary'
                            : isAvailable
                              ? 'text-gray-900'
                              : 'text-gray-400'
                        }
                        bold={isSelected}
                      >
                        {formatDuration(duration)}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </Box>
            </Box>
          )}

          <Box className='pt-4'>
            <Button
              onPress={handleReview}
              disabled={!date || !selectedStartTime || !selectedDuration}
              variant={!date || !selectedStartTime || !selectedDuration ? 'outline' : 'solid'}
              className={
                !date || !selectedStartTime || !selectedDuration
                  ? 'border-purple-92 bg-purple-98'
                  : 'bg-main-primary border-main-primary'
              }
            >
              <ButtonText
                className={
                  !date || !selectedStartTime || !selectedDuration ? 'text-gray-400' : 'text-white'
                }
              >
                Xem lại thông tin
              </ButtonText>
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className='space-y-6 pb-8'>
          <Box className='rounded-xl border border-purple-92 bg-gray-50/50 p-5 space-y-4'>
            <Text className='text-center text-lg text-main-black' bold>
              Xác nhận thông tin
            </Text>

            <Box className='space-y-3'>
              <Box className='flex-row justify-between items-center'>
                <Text className='text-gray-700'>Ngày chọn</Text>
                <Text className='text-main-black' bold>
                  {date ? format(date, 'dd/MM/yyyy') : ''}
                </Text>
              </Box>

              <Box className='flex-row justify-between items-center'>
                <Text className='text-gray-700'>Giờ bắt đầu</Text>
                <Text className='text-main-black' bold>
                  {selectedStartTime}
                </Text>
              </Box>

              <Box className='flex-row justify-between items-center'>
                <Text className='text-gray-700'>Thời lượng</Text>
                <Text className='text-main-black' bold>
                  {selectedDuration ? formatDuration(selectedDuration) : '-'}
                </Text>
              </Box>

              <View className='my-2 h-[1px] bg-purple-92' />

              <Box className='flex-row justify-between items-center'>
                <Text className='text-main-primary font-medium'>Giờ kết thúc</Text>
                <Box className='rounded-md border border-main-secondary/20 bg-main-secondary/10 px-3 py-1'>
                  <Text className='text-main-primary' bold>
                    {selectedStartTime && selectedDuration
                      ? format(
                          addMinutes(
                            new Date(`2000-01-01T${selectedStartTime}:00`),
                            selectedDuration
                          ),
                          'HH:mm'
                        )
                      : '-'}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className='flex-row gap-3'>
            <Box className='flex-1'>
              <Button
                onPress={() => setStep('selection')}
                disabled={submitting}
                variant='outline'
                className='w-full border-main-primary justify-center'
              >
                <ButtonText className='text-main-primary text-center'>Quay lại</ButtonText>
              </Button>
            </Box>
            <Box className='flex-1'>
              <Button
                onPress={handleBook}
                disabled={submitting}
                variant='solid'
                className='w-full bg-main-primary border-main-primary justify-center'
              >
                {submitting ? (
                  <ButtonSpinner color='#fff' />
                ) : (
                  <ButtonText className='text-white text-center'>Xác nhận đặt lịch</ButtonText>
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </BottomSheet>
  )
}
