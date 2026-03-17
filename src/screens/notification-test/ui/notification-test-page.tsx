import { usePushNotifications } from '@/features/notifications'
import { NotificationService } from '@/shared/services/notification'
import { useNotification } from '@/shared/services/notification/notification-provider'
import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'
import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import { Alert, ScrollView, TouchableOpacity } from 'react-native'

/**
 * Notification Test Screen
 * For manual testing of notification functionality
 */
export function NotificationTestPage() {
  const {
    expoPushToken,
    devicePushToken,
    notification: lastReceivedNotification,
    error: providerError,
    isLoading: providerLoading,
  } = useNotification()

  const { registerDevice, isRegistering, error: apiError } = usePushNotifications()
  const [localNotificationCount, setLocalNotificationCount] = useState(0)

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text)
    Alert.alert('Đã sao chép', 'Token đã được lưu vào bộ nhớ tạm')
  }

  const handleScheduleLocal = async () => {
    const count = localNotificationCount + 1
    setLocalNotificationCount(count)

    await NotificationService.scheduleLocalNotification(
      `Local Notification #${count}`,
      `Đây là notification test số ${count}. Hoạt động hoàn toàn offline!`,
      {
        test: true,
        count,
        timestamp: new Date().toISOString(),
      }
    )
    Alert.alert('✅ Thành công!', `Local notification #${count} đã được gửi`)
  }

  const handleSetBadge = async () => {
    await NotificationService.setBadgeCount(5)
    Alert.alert('Success', 'Badge count set to 5')
  }

  const handleClearBadge = async () => {
    await NotificationService.setBadgeCount(0)
    Alert.alert('Success', 'Badge cleared')
  }

  return (
    <ScrollView className='flex-1 bg-white'>
      <Box className='p-6'>
        {/* Header */}
        <Text size='3xl' bold className='mb-2 text-main-black'>
          Notification Testing
        </Text>
        <Text className='mb-4 text-main-black/70'>Test local notifications (works in Expo Go)</Text>

        {/* Expo Go Warning */}

        <Box className='gap-y-6'>
          {/* Status Section */}
          <Box className='mb-6 rounded-lg bg-white p-4 shadow-sm border border-gray-100'>
            <Text bold className='mb-4 text-lg'>
              System Status
            </Text>

            <Box className='mb-4 flex-row justify-between'>
              <Text className='text-gray-500'>Provider Status:</Text>
              <Text bold className={providerLoading ? 'text-blue-500' : 'text-green-500'}>
                {providerLoading ? 'Initializing...' : 'Ready'}
              </Text>
            </Box>

            {(providerError || apiError) && (
              <Box className='mb-4 rounded bg-red-50 p-2'>
                <Text className='text-xs text-red-600'>
                  Error: {providerError?.message || apiError?.message}
                </Text>
              </Box>
            )}

            {/* Expo Token */}
            <Box className='mb-4'>
              <Text className='mb-1 text-xs text-gray-500'>Expo Push Token:</Text>
              <Box className='flex-row items-center justify-between rounded bg-gray-50 p-2'>
                <Text numberOfLines={1} className='flex-1 text-xs font-mono text-gray-700'>
                  {expoPushToken || 'Chưa có token'}
                </Text>
                {expoPushToken && (
                  <TouchableOpacity onPress={() => copyToClipboard(expoPushToken)} className='ml-2'>
                    <IconLucide name='Copy' size={16} color='#4B5563' />
                  </TouchableOpacity>
                )}
              </Box>
            </Box>

            {/* Native FCM Token */}
            <Box>
              <Text className='mb-1 text-xs text-gray-500'>Native FCM Token (cho Backend):</Text>
              <Box className='flex-row items-center justify-between rounded bg-gray-50 p-2'>
                <Text numberOfLines={1} className='flex-1 text-xs font-mono text-gray-700'>
                  {devicePushToken || 'Chưa có token'}
                </Text>
                {devicePushToken && (
                  <TouchableOpacity
                    onPress={() => devicePushToken && copyToClipboard(devicePushToken)}
                    className='ml-2'
                  >
                    <IconLucide name='Copy' size={16} color='#4B5563' />
                  </TouchableOpacity>
                )}
              </Box>
            </Box>
          </Box>

          {/* Last Received Notification */}
          {lastReceivedNotification && (
            <Box className='mb-6 rounded-lg border border-green-200 bg-green-50 p-4'>
              <Text bold className='mb-2 text-green-800'>
                Last Received Notification:
              </Text>
              <Text className='text-sm text-green-700'>
                Title: {lastReceivedNotification.request.content.title}
              </Text>
              <Text className='text-sm text-green-700'>
                Body: {lastReceivedNotification.request.content.body}
              </Text>
            </Box>
          )}

          {/* Actions Section */}
          <Box className='gap-y-4'>
            <Text bold className='text-lg'>
              Actions
            </Text>

            <TouchableOpacity
              onPress={handleScheduleLocal}
              className='flex-row items-center justify-center gap-2 rounded-xl bg-main-black p-4'
            >
              <IconLucide name='Bell' size={20} color='white' />
              <Text bold className='text-white'>
                Send Local Notification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => registerDevice()}
              disabled={isRegistering}
              className={`flex-row items-center justify-center gap-2 rounded-xl p-4 ${
                isRegistering ? 'bg-gray-300' : 'bg-main-black'
              }`}
            >
              <IconLucide name='RefreshCw' size={20} color='white' />
              <Text bold className='text-white'>
                {isRegistering ? 'Registering...' : 'Register Device (API)'}
              </Text>
            </TouchableOpacity>

            <Box className='flex-row gap-4'>
              <TouchableOpacity
                onPress={handleSetBadge}
                className='flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4'
              >
                <IconLucide name='CircleDot' size={20} color='#1F2937' />
                <Text bold>Set Badge (5)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClearBadge}
                className='flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4'
              >
                <IconLucide name='Trash2' size={20} color='#EF4444' />
                <Text bold className='text-red-500'>
                  Clear Badge
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
      </Box>
    </ScrollView>
  )
}
