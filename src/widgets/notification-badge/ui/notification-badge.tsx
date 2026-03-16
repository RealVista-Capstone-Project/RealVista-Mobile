import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { useUnreadCount } from '@/features/notifications'

/**
 * Notification Badge Widget
 * Displays unread notification count on tab bar or other UI elements
 */
export function NotificationBadge() {
  const { count, isLoading } = useUnreadCount()

  // Don't show badge if no unread notifications or still loading
  if (isLoading || !count || count === 0) {
    return null
  }

  return (
    <Box
      className='absolute -right-1 -top-1 min-w-5 items-center justify-center rounded-full bg-red-500 px-1'
      style={{
        height: 20,
        minWidth: 20,
      }}
    >
      <Text className='text-xs font-bold text-white' style={{ lineHeight: 14 }}>
        {count > 99 ? '99+' : count}
      </Text>
    </Box>
  )
}
