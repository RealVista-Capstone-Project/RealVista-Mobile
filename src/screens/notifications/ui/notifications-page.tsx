import { FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { useNotifications } from '@/features/notifications'
import { NotificationItem } from './components'

import IconLucide from '@/shared/ui/icon-lucide/icon'

export function NotificationsPage() {
  const { notifications, isLoading, refetch, markAsRead, markAllAsRead, isMarkingAllAsRead } =
    useNotifications()

  const handleNotificationPress = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId)
    }
  }

  // Loading state
  if (isLoading && notifications.length === 0) {
    return (
      <Box className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size='large' color='#7065F0' />
      </Box>
    )
  }

  return (
    <Box className='flex-1 bg-white'>
      {/* Header */}
      <Box className='border-b border-gray-100 bg-white px-6 py-4'>
        <Box className='flex-row items-center justify-between'>
          <Text size='2xl' bold className='text-main-black'>
            Thông báo
          </Text>
          {notifications.some((n) => !n.is_read) && (
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className='flex-row items-center gap-2'
            >
              <IconLucide name='CheckCheck' size={18} color='#7065F0' />
              <Text className='text-brand-primary'>Đánh dấu tất cả</Text>
            </TouchableOpacity>
          )}
        </Box>
      </Box>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notification_id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item.notification_id, item.is_read)}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          <Box className='items-center justify-center p-12'>
            <Box className='mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
              <IconLucide name='Bell' size={40} color='#808494' />
            </Box>
            <Text className='mb-2 text-lg font-bold text-main-black'>Không có thông báo</Text>
            <Text className='text-center text-main-black/50'>
              Bạn sẽ nhận được thông báo về tin đăng mới, thay đổi giá và lịch hẹn tại đây
            </Text>
          </Box>
        }
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : undefined}
      />
    </Box>
  )
}
