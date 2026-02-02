import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { TouchableOpacity } from 'react-native'
import type { Notification, EventType } from '@/entities/notification'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface NotificationItemProps {
  notification: Notification
  onPress: () => void
}

// Icon mapping for event types
const EVENT_ICONS: Record<EventType, string> = {
  NEW_LISTING: 'Home',
  PRICE_CHANGE: 'TrendingDown',
  APPOINTMENT_REMINDER: 'Clock',
  APPOINTMENT_CONFIRMED: 'CheckCircle',
  APPOINTMENT_CANCELLED: 'XCircle',
  NEW_MESSAGE: 'MessageSquare',
  LISTING_EXPIRED: 'AlertCircle',
  LISTING_SOLD: 'DollarSign',
  SYSTEM: 'Bell',
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const icon = EVENT_ICONS[notification.event_type] || 'Bell'
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: vi,
  })

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`border-b border-gray-100 p-4 ${notification.is_read ? 'bg-white' : 'bg-purple-50'}`}
      accessibilityRole='button'
      accessibilityLabel={`Notification: ${notification.title}`}
      accessibilityState={{ selected: !notification.is_read }}
    >
      <Box className='flex-row gap-3'>
        {/* Icon */}
        <Box
          className={`h-10 w-10 items-center justify-center rounded-full ${
            notification.is_read ? 'bg-gray-100' : 'bg-brand-primary/10'
          }`}
        >
          <IconLucide
            name={icon as any}
            size={20}
            color={notification.is_read ? '#808494' : '#7065F0'}
          />
        </Box>

        {/* Content */}
        <Box className='flex-1'>
          <Box className='mb-1 flex-row items-center justify-between'>
            <Text
              className={`flex-1 ${notification.is_read ? 'text-main-black' : 'text-main-black font-bold'}`}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            {!notification.is_read && (
              <Box className='ml-2 h-2 w-2 rounded-full bg-brand-primary' />
            )}
          </Box>

          <Text className='mb-2 text-main-black/70' numberOfLines={2}>
            {notification.message}
          </Text>

          <Text className='text-xs text-main-black/50'>{timeAgo}</Text>
        </Box>
      </Box>
    </TouchableOpacity>
  )
}
