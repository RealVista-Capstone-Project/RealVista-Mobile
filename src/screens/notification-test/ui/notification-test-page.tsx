import { useState, useEffect } from 'react'
import { ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { NotificationService } from '@/shared/services/notification'
import { useSendTestNotification } from '@/entities/notification'
import { usePushNotifications, useNotificationListeners } from '@/features/notifications'
import * as Clipboard from 'expo-clipboard'

/**
 * Notification Test Screen
 * For manual testing of notification functionality
 */
export function NotificationTestPage() {
  const [pushToken, setPushToken] = useState<string | null>(null)
  const [lastNotification, setLastNotification] = useState<any>(null)
  const [lastResponse, setLastResponse] = useState<any>(null)
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown')
  const [localNotificationCount, setLocalNotificationCount] = useState(0)

  const { registerDevice } = usePushNotifications()
  const sendTest = useSendTestNotification()

  // Setup notification listeners
  useNotificationListeners(
    (notification) => {
      console.log('📬 Notification received:', notification)
      setLastNotification(notification)
    },
    (response) => {
      console.log('👆 User tapped notification:', response)
      setLastResponse(response)
    }
  )

  // Check permissions on mount
  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    const hasPermission = await NotificationService.requestPermissions()
    setPermissionStatus(hasPermission ? 'granted' : 'denied')
  }

  const handleRegisterDevice = async () => {
    const token = await registerDevice()
    if (token) {
      setPushToken(token)
      Alert.alert('Success', 'Device registered!\nToken copied to clipboard')
      await Clipboard.setStringAsync(token)
    } else {
      Alert.alert(
        'Expo Go Limitation',
        'Push notifications không hoạt động trên Expo Go SDK 53+.\n\nBạn có thể test Local Notifications thay thế!'
      )
    }
  }

  const _handleSendTestNotification = async () => {
    if (!pushToken) {
      Alert.alert(
        'Expo Go Limitation',
        'Push notifications không hoạt động trên Expo Go.\n\nHãy dùng "Schedule Local Notification" để test!'
      )
      return
    }

    sendTest.mutate(
      {
        token: pushToken,
        title: 'Test từ Mobile App',
        body: 'Đây là notification test từ Firebase',
      },
      {
        onSuccess: (response) => {
          Alert.alert('Success', `Message sent!\nID: ${response.data.messageId}`)
        },
        onError: (error) => {
          Alert.alert('Error', error.message)
        },
      }
    )
  }

  const handleCopyToken = async () => {
    if (pushToken) {
      await Clipboard.setStringAsync(pushToken)
      Alert.alert('Copied', 'Token copied to clipboard')
    }
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
        <Box className='mb-6 rounded-lg border-2 border-orange-300 bg-orange-50 p-4'>
          <Box className='mb-2 flex-row items-center gap-2'>
            <IconLucide name='TriangleAlert' size={20} color='#F59E0B' />
            <Text bold className='text-orange-600'>
              Expo Go Limitation
            </Text>
          </Box>
          <Text className='mb-2 text-sm text-orange-700'>
            Push notifications (Firebase) không hoạt động trên Expo Go SDK 53+
          </Text>
          <Text className='text-sm text-orange-700'>
            ✅ Local Notifications vẫn hoạt động bình thường!
          </Text>
        </Box>

        {/* Permission Status */}
        <Box className='mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <Box className='mb-2 flex-row items-center gap-2'>
            <IconLucide
              name={permissionStatus === 'granted' ? 'Check' : 'X'}
              size={20}
              color={permissionStatus === 'granted' ? '#10B981' : '#EF4444'}
            />
            <Text bold className='text-main-black'>
              Permission Status
            </Text>
          </Box>
          <Text className='text-main-black/70'>{permissionStatus}</Text>
        </Box>

        {/* Push Token */}
        {pushToken && (
          <Box className='mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4'>
            <Box className='mb-2 flex-row items-center justify-between'>
              <Text bold className='text-main-black'>
                Push Token
              </Text>
              <TouchableOpacity onPress={handleCopyToken}>
                <IconLucide name='Copy' size={18} color='#7065F0' />
              </TouchableOpacity>
            </Box>
            <Text className='text-xs text-main-black/70' numberOfLines={3}>
              {pushToken}
            </Text>
          </Box>
        )}

        {/* Actions */}
        <Box className='gap-3'>
          {/* Schedule Local Notification - PRIMARY */}
          <TouchableOpacity
            onPress={handleScheduleLocal}
            className='flex-row items-center justify-between rounded-lg bg-brand-primary p-4'
          >
            <Box className='flex-row items-center gap-3'>
              <IconLucide name='Bell' size={24} color='#FFFFFF' />
              <Box>
                <Text bold className='text-white'>
                  Test Local Notification
                </Text>
                <Text className='text-xs text-white/80'>Hoạt động trên Expo Go ✅</Text>
              </Box>
            </Box>
            <Text className='text-white/80'>#{localNotificationCount}</Text>
          </TouchableOpacity>

          {/* Set Badge */}
          <TouchableOpacity
            onPress={handleSetBadge}
            className='flex-row items-center gap-3 rounded-lg bg-orange-500 p-4'
          >
            <IconLucide name='Hash' size={24} color='#FFFFFF' />
            <Text bold className='text-white'>
              Set Badge Count (5)
            </Text>
          </TouchableOpacity>

          {/* Clear Badge */}
          <TouchableOpacity
            onPress={handleClearBadge}
            className='flex-row items-center gap-3 rounded-lg bg-gray-500 p-4'
          >
            <IconLucide name='X' size={24} color='#FFFFFF' />
            <Text bold className='text-white'>
              Clear Badge
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <Box className='my-2 border-t border-gray-200' />
          <Text className='mb-2 text-sm text-gray-500'>⚠️ Không hoạt động trên Expo Go:</Text>

          {/* Register Device - DISABLED */}
          <TouchableOpacity
            onPress={handleRegisterDevice}
            disabled={true}
            className='flex-row items-center justify-between rounded-lg bg-gray-300 p-4'
          >
            <Box className='flex-row items-center gap-3'>
              <IconLucide name='Smartphone' size={24} color='#808494' />
              <Text bold className='text-gray-600'>
                Register Device (Không khả dụng)
              </Text>
            </Box>
          </TouchableOpacity>

          {/* Send Test Notification - DISABLED */}
          <TouchableOpacity
            disabled={true}
            className='flex-row items-center justify-between rounded-lg bg-gray-300 p-4'
          >
            <Box className='flex-row items-center gap-3'>
              <IconLucide name='Send' size={24} color='#808494' />
              <Text bold className='text-gray-600'>
                Send Test via Backend (Không khả dụng)
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>

        {/* Last Notification Received */}
        {lastNotification && (
          <Box className='mt-6 rounded-lg border border-green-200 bg-green-50 p-4'>
            <Text bold className='mb-2 text-main-black'>
              Last Notification Received
            </Text>
            <Text className='text-xs text-main-black/70'>
              {JSON.stringify(lastNotification.request.content, null, 2)}
            </Text>
          </Box>
        )}

        {/* Last Notification Response */}
        {lastResponse && (
          <Box className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <Text bold className='mb-2 text-main-black'>
              Last User Tap
            </Text>
            <Text className='text-xs text-main-black/70'>
              {JSON.stringify(lastResponse.notification.request.content, null, 2)}
            </Text>
          </Box>
        )}

        {/* Instructions */}
        <Box className='mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <Text bold className='mb-2 text-main-black'>
            📝 Testing Instructions (Expo Go)
          </Text>
          <Text className='mb-2 text-sm text-main-black/70'>
            1. Click &quot;Test Local Notification&quot; để gửi notification
          </Text>
          <Text className='mb-2 text-sm text-main-black/70'>
            2. Notification sẽ xuất hiện ngay lập tức
          </Text>
          <Text className='mb-2 text-sm text-main-black/70'>
            3. Kiểm tra section &quot;Last Notification Received&quot; bên dưới
          </Text>
          <Text className='mb-2 text-sm text-main-black/70'>4. Test badge count (iOS only)</Text>
          <Box className='mt-3 rounded bg-blue-50 p-3'>
            <Text className='text-xs font-bold text-blue-700'>
              💡 Để test Push Notifications (Firebase):
            </Text>
            <Text className='text-xs text-blue-700'>
              Cần build development build, không thể dùng Expo Go
            </Text>
          </Box>
        </Box>
      </Box>
    </ScrollView>
  )
}
