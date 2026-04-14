import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { ArrowLeft, Plus, SlidersHorizontal, AlertTriangle } from 'lucide-react-native'

import { useProperty3dOperations, usePropertyDetail, propertyApi } from '@/entities/property'
import type { PropertyDetailMedia, Property3dOperation } from '@/entities/property'

import { useThreeDQuota } from '@/entities/billing'

import { StatsBar } from './components/stats-bar'
import { EmptyState } from './components/empty-state'
import { RoomCard, AddRoomCard } from './components/room-card'
import type { RoomGroup } from './components/room-card'

interface Manage3dScreenProps {
  propertyId: string
}

type SortOrder = 'desc' | 'asc'

export function Manage3dScreen({ propertyId }: Manage3dScreenProps) {
  const router = useRouter()
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const { remaining, quotaLimit, unlimited, isLocked, isLoading: isQuotaLoading } = useThreeDQuota()

  const {
    data: operations = [],
    isLoading: opsLoading,
    isRefetching: opsRefetching,
    refetch: refetchOps,
    error: opsError,
  } = useProperty3dOperations(propertyId)

  const hasPendingOps = operations.some(
    (op) => op.status === 'PENDING' || op.status === 'GENERATING'
  )

  const {
    data: propertyDetail,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = usePropertyDetail(propertyId, { refetchInterval: hasPendingOps ? 15_000 : false })

  const prevHadPendingOps = useRef(hasPendingOps)
  useEffect(() => {
    if (prevHadPendingOps.current && !hasPendingOps) {
      refetchDetail()
    }
    prevHadPendingOps.current = hasPendingOps
  }, [hasPendingOps, refetchDetail])

  const isLoading = opsLoading || detailLoading
  const isRefreshing = opsRefetching

  useFocusEffect(
    useCallback(() => {
      refetchOps()
      refetchDetail()
    }, [refetchOps, refetchDetail])
  )

  const onRefresh = () => {
    refetchOps()
    refetchDetail()
  }

  const roomGroups = useMemo<RoomGroup[]>(() => {
    if (!operations || operations.length === 0) return []

    const threeDMedia: PropertyDetailMedia[] =
      propertyDetail?.media?.filter((m) => m.media_type === 'THREE_D') ?? []

    const grouped = new Map<string, Property3dOperation[]>()
    for (const op of operations) {
      const key = op.room_name || 'Unnamed Room'
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(op)
    }

    const groups = Array.from(grouped.entries())
      .map(([roomName, ops]) => {
        const sorted = [...ops].sort(
          (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        )
        const latestOperation = sorted[0]
        const hasSuccessful = sorted.some((op) => op.status === 'SUCCEEDED')
        const matchedMedia =
          threeDMedia.find((m) => {
            const rName = (m.metadata?.room_name as string) ?? 'Unnamed Room'
            return rName === roomName
          }) ?? null

        const succeededOp = sorted.find((op) => op.status === 'SUCCEEDED')
        const operationId = (succeededOp ?? latestOperation).id

        return {
          roomName,
          operations: sorted,
          latestOperation,
          hasSuccessful,
          matchedMedia,
          operationId,
        }
      })
      .filter((group) => {
        if (group.latestOperation.status === 'SUCCEEDED' && !group.matchedMedia && !detailLoading)
          return false
        return true
      })

    return [...groups].sort((a, b) => {
      const aTime = new Date(a.latestOperation.created_at ?? 0).getTime()
      const bTime = new Date(b.latestOperation.created_at ?? 0).getTime()
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime
    })
  }, [operations, propertyDetail, detailLoading, sortOrder])

  const stats = useMemo(() => {
    const total = roomGroups.length
    const ready = roomGroups.filter((g) => g.matchedMedia).length
    const processing = roomGroups.filter(
      (g) => g.latestOperation.status === 'PENDING' || g.latestOperation.status === 'GENERATING'
    ).length
    return { total, ready, processing }
  }, [roomGroups])

  const handleView = (group: RoomGroup) => {
    router.push(`/world-viewer?propertyId=${propertyId}&roomName=${group.roomName}`)
  }

  const handleDelete = (operationId: string, roomName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa ảnh 3D của phòng "${roomName}"? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyApi.delete3dOperation(propertyId, operationId)
              await Promise.all([refetchOps(), refetchDetail()])
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa 3D tour. Vui lòng thử lại.')
            }
          },
        },
      ]
    )
  }

  const handleAddRoom = () => {
    router.push({ pathname: '/capture', params: { propertyId } })
  }

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  const quotaBadge =
    !isQuotaLoading && !unlimited ? (
      <View className={`rounded-full px-3 py-1 ${isLocked ? 'bg-red-100' : 'bg-purple-100'}`}>
        <Text className={`text-xs font-medium ${isLocked ? 'text-red-600' : 'text-purple-700'}`}>
          {isLocked
            ? 'Hết lượt – Nâng cấp'
            : `${remaining}${quotaLimit ? `/${quotaLimit}` : ''} lượt`}
        </Text>
      </View>
    ) : null

  if (isLoading && !isRefreshing) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <ActivityIndicator size='large' color='#7065F0' />
        <Text className='mt-4 text-sm text-gray-500'>Đang tải dữ liệu 3D...</Text>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <SafeAreaView className='bg-gray-50'>
        {/* Header */}
        <View className='flex-row items-center justify-between px-5 pt-2 pb-3'>
          <TouchableOpacity
            className='w-10 h-10 rounded-2xl bg-white items-center justify-center shadow-sm'
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <ArrowLeft color='#111827' size={20} />
          </TouchableOpacity>

          <View className='flex-1 items-center gap-1'>
            <Text
              className='text-base text-gray-900'
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              Quản lý 3D
            </Text>
            <Text
              className='text-xs text-gray-400'
              style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
            >
              Ảnh 3D các phòng
            </Text>
            {quotaBadge}
          </View>

          <TouchableOpacity
            className={`w-10 h-10 rounded-2xl bg-main-primary items-center justify-center shadow-sm ${isLocked ? 'opacity-40' : ''}`}
            onPress={handleAddRoom}
            disabled={isLocked}
            activeOpacity={0.75}
          >
            <Plus color='#FFFFFF' size={20} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor='#7065F0' />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Analytics card */}
        <StatsBar total={stats.total} ready={stats.ready} processing={stats.processing} />

        {/* Section header */}
        <View className='flex-row items-center justify-between px-5 mb-4'>
          <Text className='text-lg text-gray-900' style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
            Ảnh 3D đang hoạt động
          </Text>
          <TouchableOpacity
            className='w-9 h-9 rounded-xl bg-white items-center justify-center shadow-sm'
            onPress={toggleSort}
            activeOpacity={0.75}
          >
            <SlidersHorizontal size={16} color='#6B7280' />
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {opsError ? (
          <View className='flex-row items-center bg-red-50 mx-5 px-4 py-3 rounded-2xl mb-4 border border-red-100'>
            <AlertTriangle color='#EF4444' size={18} />
            <Text className='ml-3 text-sm text-red-500 flex-1'>
              Không thể tải dữ liệu. Kéo xuống để thử lại.
            </Text>
          </View>
        ) : null}

        {/* Cards */}
        <View className='px-5'>
          {roomGroups.length === 0 ? (
            <EmptyState onCreatePress={isLocked ? undefined : handleAddRoom} />
          ) : (
            <>
              {roomGroups.map((group) => (
                <RoomCard
                  key={group.roomName}
                  group={group}
                  propertyId={propertyId}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
              <View
                pointerEvents={isLocked ? 'none' : 'auto'}
                className={isLocked ? 'opacity-40' : ''}
              >
                <AddRoomCard onPress={handleAddRoom} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
