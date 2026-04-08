import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { RefreshCw, AlertTriangle, Trash2, Plus } from 'lucide-react-native'
import type { Property3dOperation, PropertyDetailMedia } from '@/entities/property'
import { RenameRoomModal } from './rename-room-modal'

export interface RoomGroup {
  roomName: string
  operations: Property3dOperation[]
  latestOperation: Property3dOperation
  hasSuccessful: boolean
  matchedMedia: PropertyDetailMedia | null
  operationId?: string
}

/** Returns a relative time label in Vietnamese, e.g. "Vừa xong", "2 ngày trước" */
function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHour < 24) return `${diffHour} giờ trước`
  if (diffDay < 7) return `${diffDay} ngày trước`

  return new Date(dateStr).toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Thumbnail area: shows image if available, grey processing placeholder otherwise */
function ThumbnailArea({ group }: { group: RoomGroup }) {
  const isProcessing =
    group.latestOperation.status === 'PENDING' || group.latestOperation.status === 'GENERATING'
  const thumbnailUrl = group.matchedMedia?.thumbnail_url ?? group.matchedMedia?.media_url ?? null

  if (thumbnailUrl) {
    return (
      <View className='w-full h-52 rounded-t-3xl overflow-hidden bg-gray-100'>
        {/* READY badge */}
        <View className='absolute top-3 left-3 z-10 flex-row items-center bg-white/90 rounded-full px-3 py-1.5 gap-1.5'>
          <View className='w-2 h-2 rounded-full bg-emerald-500' />
          <Text
            className='text-xs text-gray-800 uppercase tracking-widest'
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Sẵn sàng
          </Text>
        </View>
        <Image source={{ uri: thumbnailUrl }} className='w-full h-full' resizeMode='cover' />
      </View>
    )
  }

  if (isProcessing) {
    return (
      <View className='w-full h-52 rounded-t-3xl bg-gray-200 items-center justify-center gap-2'>
        <RefreshCw size={28} color='#9CA3AF' />
        <Text
          className='text-xs text-gray-400 uppercase tracking-widest'
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          Đang xử lý...
        </Text>
      </View>
    )
  }

  // FAILED or no thumbnail
  return (
    <View className='w-full h-52 rounded-t-3xl bg-red-50 items-center justify-center gap-2'>
      <AlertTriangle size={28} color='#EF4444' />
      <Text
        className='text-xs text-red-400 uppercase tracking-widest'
        style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
      >
        Thất bại
      </Text>
    </View>
  )
}

interface RoomCardProps {
  group: RoomGroup
  propertyId: string
  onView: (group: RoomGroup) => void
  onDelete: (operationId: string, roomName: string) => void
}

export function RoomCard({ group, propertyId, onView, onDelete }: RoomCardProps) {
  const hasModel = group.matchedMedia !== null
  const [renameVisible, setRenameVisible] = useState(false)

  const dateLabel = formatDate(group.latestOperation.created_at)

  return (
    <>
      <View className='bg-white rounded-3xl overflow-hidden shadow-sm mb-4'>
        {/* Thumbnail */}
        <ThumbnailArea group={group} />

        {/* Info section */}
        <View className='px-4 pt-3 pb-4'>
          {/* Room name + date */}
          <View className='flex-row items-start justify-between mb-0.5'>
            <Text
              className='text-lg text-gray-900 flex-1 mr-2'
              numberOfLines={1}
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              {group.roomName}
            </Text>
            <Text
              className='text-xs text-gray-400 mt-1'
              style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
            >
              {dateLabel}
            </Text>
          </View>

          {/* Subtitle — room type context */}
          <Text
            className='text-sm text-gray-400 mb-3'
            style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
          >
            Ảnh 3D • {group.roomName}
          </Text>

          {/* Action row */}
          <View className='flex-row items-center justify-between'>
            {hasModel ? (
              <TouchableOpacity
                className='border border-gray-200 rounded-full px-5 py-2'
                onPress={() => onView(group)}
                activeOpacity={0.75}
              >
                <Text
                  className='text-sm text-main-primary'
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
                >
                  Xem ảnh 3D
                </Text>
              </TouchableOpacity>
            ) : (
              <View className='border border-gray-200 rounded-full px-5 py-2 opacity-40'>
                <Text
                  className='text-sm text-gray-400'
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
                >
                  Xem ảnh 3D
                </Text>
              </View>
            )}

            {group.operationId ? (
              <TouchableOpacity
                className='w-10 h-10 rounded-xl items-center justify-center'
                onPress={() => onDelete(group.operationId!, group.roomName)}
                activeOpacity={0.75}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Trash2 size={18} color='#9CA3AF' />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {group.operationId ? (
        <RenameRoomModal
          visible={renameVisible}
          propertyId={propertyId}
          operationId={group.operationId}
          currentName={group.roomName}
          onClose={() => setRenameVisible(false)}
        />
      ) : null}
    </>
  )
}

interface AddRoomCardProps {
  onPress: () => void
}

export function AddRoomCard({ onPress }: AddRoomCardProps) {
  return (
    <TouchableOpacity
      className='bg-purple-50/40 rounded-3xl h-48 items-center justify-center border-2 border-dashed border-purple-200 mb-4'
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View className='w-14 h-14 rounded-full bg-white items-center justify-center mb-3 shadow-sm'>
        <Plus size={24} color='#7065F0' />
      </View>
      <Text className='text-sm text-main-primary' style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
        Thêm phòng mới
      </Text>
    </TouchableOpacity>
  )
}
