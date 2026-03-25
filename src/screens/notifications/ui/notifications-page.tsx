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
      <Box className='bg-white px-5 pb-2 pt-4'>
        <Box className='flex-row items-center justify-between'>
          <Text className='font-jakarta-bold text-2xl text-main-black'>Thông báo</Text>
          {notifications.some((n) => !n.is_read) && (
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className='flex-row items-center gap-1.5'
            >
              <IconLucide name='CheckCheck' size={18} color='#7065F0' />
              <Text className='font-jakarta-medium text-sm text-brand-primary'>
                Đánh dấu đã đọc
              </Text>
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
        contentContainerStyle={
          notifications.length === 0
            ? { flex: 1 }
            : { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }
        }
        ItemSeparatorComponent={() => <Box className='h-3' />}
        ListEmptyComponent={
          <Box className='flex-1 items-center justify-center p-12'>
            <Box className='mb-4 h-20 w-20 items-center justify-center rounded-full bg-purple-98'>
              <IconLucide name='Bell' size={40} color='#9EA3AE' />
            </Box>
            <Text className='mb-2 font-jakarta-bold text-lg text-main-black'>
              Không có thông báo
            </Text>
            <Text className='text-center font-jakarta text-sm text-text-muted'>
              Bạn sẽ nhận được thông báo về tin đăng mới, thay đổi giá và lịch hẹn tại đây
            </Text>
          </Box>
        }
        ListFooterComponent={
          notifications.length > 0 ? (
            <Box className='items-center pb-4 pt-3'>
              <TouchableOpacity>
                <Text className='font-jakarta-semibold text-sm text-brand-primary'>
                  Xem tất cả thông báo
                </Text>
              </TouchableOpacity>
            </Box>
          ) : null
        }
      />
    </Box>
  )
}
