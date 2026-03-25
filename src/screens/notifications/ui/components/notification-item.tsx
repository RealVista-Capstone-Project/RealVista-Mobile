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

// Background color mapping for event type icons
const EVENT_ICON_BG: Record<EventType, string> = {
  NEW_LISTING: 'bg-blue-50',
  PRICE_CHANGE: 'bg-green-50',
  APPOINTMENT_REMINDER: 'bg-amber-50',
  APPOINTMENT_CONFIRMED: 'bg-emerald-50',
  APPOINTMENT_CANCELLED: 'bg-red-50',
  NEW_MESSAGE: 'bg-purple-98',
  LISTING_EXPIRED: 'bg-orange-50',
  LISTING_SOLD: 'bg-green-50',
  SYSTEM: 'bg-purple-98',
}

// Icon color mapping for event types
const EVENT_ICON_COLOR: Record<EventType, string> = {
  NEW_LISTING: '#3B82F6',
  PRICE_CHANGE: '#10B981',
  APPOINTMENT_REMINDER: '#F59E0B',
  APPOINTMENT_CONFIRMED: '#10B981',
  APPOINTMENT_CANCELLED: '#EF4444',
  NEW_MESSAGE: '#7065F0',
  LISTING_EXPIRED: '#F97316',
  LISTING_SOLD: '#10B981',
  SYSTEM: '#7065F0',
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const icon = EVENT_ICONS[notification.event_type] || 'Bell'
  const iconBg = EVENT_ICON_BG[notification.event_type] || 'bg-purple-98'
  const iconColor = EVENT_ICON_COLOR[notification.event_type] || '#7065F0'

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: vi,
  })

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-xl border p-4 ${
        notification.is_read ? 'border-gray-100 bg-white' : 'border-purple-92 bg-purple-98'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
      accessibilityRole='button'
      accessibilityLabel={`Notification: ${notification.title}`}
      accessibilityState={{ selected: !notification.is_read }}
    >
      <Box className='flex-row items-start gap-3'>
        {/* Content - Left side */}
        <Box className='flex-1'>
          <Box className='mb-1 flex-row items-center gap-1.5'>
            {!notification.is_read && <Box className='h-2 w-2 rounded-full bg-brand-primary' />}
            <Text
              className={`flex-1 font-jakarta-semibold text-sm ${
                notification.is_read ? 'text-main-black' : 'text-main-black'
              }`}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
          </Box>

          <Text className='mb-2 font-jakarta text-sm text-text-muted' numberOfLines={2}>
            {notification.message}
          </Text>

          <Text className='font-jakarta text-xs text-text-muted'>{timeAgo}</Text>
        </Box>

        {/* Icon - Right side */}
        <Box className={`h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
          <IconLucide name={icon as any} size={20} color={iconColor} />
        </Box>
      </Box>
    </TouchableOpacity>
  )
}
