import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { TouchableOpacity } from 'react-native'
import type { Notification, EventType } from '@/entities/notification'
import { format } from 'date-fns'

interface NotificationItemProps {
  notification: Notification
  onPress: () => void
}

// Property-themed icon mapping
const EVENT_ICONS: Record<EventType, string> = {
  NEW_LISTING: 'MapPin',
  PRICE_CHANGE: 'Tag',
  APPOINTMENT_REMINDER: 'CalendarClock',
  APPOINTMENT_CONFIRMED: 'CalendarCheck',
  APPOINTMENT_CANCELLED: 'CalendarX',
  NEW_MESSAGE: 'MessageCircle',
  NEW_TOUR_REQUEST: 'Building2',
  LISTING_EXPIRED: 'CalendarOff',
  LISTING_SOLD: 'HandCoins',
  SYSTEM: 'Bell',
}

// Background colors per event type
const EVENT_ICON_BG: Record<EventType, string> = {
  NEW_LISTING: '#E0F2F1',
  PRICE_CHANGE: '#FFF3E0',
  APPOINTMENT_REMINDER: '#FFF8E1',
  APPOINTMENT_CONFIRMED: '#E8F5E9',
  APPOINTMENT_CANCELLED: '#FFEBEE',
  NEW_MESSAGE: '#EDE7F6',
  NEW_TOUR_REQUEST: '#E3F2FD',
  LISTING_EXPIRED: '#FBE9E7',
  LISTING_SOLD: '#F3E5F5',
  SYSTEM: '#F0EFFB',
}

// Icon colors per event type
const EVENT_ICON_COLOR: Record<EventType, string> = {
  NEW_LISTING: '#00897B',
  PRICE_CHANGE: '#E65100',
  APPOINTMENT_REMINDER: '#F59E0B',
  APPOINTMENT_CONFIRMED: '#43A047',
  APPOINTMENT_CANCELLED: '#E53935',
  NEW_MESSAGE: '#5E35B1',
  NEW_TOUR_REQUEST: '#1E88E5',
  LISTING_EXPIRED: '#D84315',
  LISTING_SOLD: '#8E24AA',
  SYSTEM: '#7065F0',
}

function formatTimestamp(dateStr: string): string {
  try {
    return format(new Date(dateStr), "MMM dd, yyyy 'at' hh:mm a")
  } catch {
    return dateStr
  }
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const icon = EVENT_ICONS[notification.event_type] ?? 'Bell'
  const iconBg = EVENT_ICON_BG[notification.event_type] ?? '#F0EFFB'
  const iconColor = EVENT_ICON_COLOR[notification.event_type] ?? '#7065F0'

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`rounded-xl border p-4 ${
        notification.is_read ? 'border-gray-100 bg-white' : 'border-purple-92 bg-purple-98'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
      }}
      accessibilityRole='button'
      accessibilityLabel={`Notification: ${notification.title}`}
    >
      <Box className='flex-row items-start gap-3'>
        {/* Content - Left side */}
        <Box className='flex-1'>
          {!notification.is_read && (
            <Box className='mb-1 h-1.5 w-1.5 rounded-full bg-brand-primary' />
          )}
          <Text className='mb-1 font-jakarta-semibold text-sm text-main-black' numberOfLines={2}>
            {notification.title}
          </Text>

          <Text className='mb-2 font-jakarta text-sm text-text-muted' numberOfLines={2}>
            {notification.message}
          </Text>

          <Text className='font-jakarta text-xs text-text-muted'>
            {formatTimestamp(notification.created_at)}
          </Text>
        </Box>

        {/* Icon - Right side */}
        <Box
          className='h-11 w-11 items-center justify-center rounded-full'
          style={{ backgroundColor: iconBg }}
        >
          <IconLucide name={icon as any} size={22} color={iconColor} />
        </Box>
      </Box>
    </TouchableOpacity>
  )
}
