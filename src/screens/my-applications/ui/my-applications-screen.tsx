import React, { useState, useMemo } from 'react'
import { ActivityIndicator, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { ApplicationCard } from '@/features/tenant-application/ui/application-card'
import { ApplicationDetailModal } from '@/features/tenant-application/ui/application-detail-modal'
import { OverviewCards } from '@/features/tenant-application/ui/overview-cards'
import { useDeleteApplication } from '@/features/tenant-application/hooks/use-delete-application'
import { useMyApplications } from '@/features/tenant-application/hooks/use-my-applications'
import { TenantApplication } from '@/entities/tenant-application/model/types'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { IconSymbol } from '@/shared/ui/icon-symbol'

const STATUSES = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Chờ duyệt', value: 'ACTIVE' },
  { label: 'Bản nháp', value: 'DRAFT' },
  { label: 'Chấp nhận', value: 'ACCEPTED' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
]

export const MyApplicationsScreen = () => {
  const { applications, isLoading, isError, refetch } = useMyApplications()
  const deleteMutation = useDeleteApplication()
  const [selectedApp, setSelectedApp] = useState<TenantApplication | null>(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const filteredApplications = useMemo(() => {
    return (
      applications?.filter((app) => {
        const matchesSearch = app.title?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
        return matchesSearch && matchesStatus
      }) || []
    )
  }, [applications, searchQuery, statusFilter])

  if (isLoading) {
    return (
      <Box className='flex-1 items-center justify-center bg-[#F7F7FD]'>
        <ActivityIndicator size='large' color='#6366f1' />
        <Text className='mt-4 text-gray-500 font-medium'>Đang tải dữ liệu...</Text>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box className='flex-1 items-center justify-center bg-[#F7F7FD]'>
        <IconSymbol name='exclamationmark.triangle.fill' size={48} color='#ef4444' />
        <Text className='mt-4 text-red-500 font-medium'>Không thể tải danh sách đơn đăng ký.</Text>
      </Box>
    )
  }

  const ListHeader = (
    <Box className='pb-4'>
      <Text className='text-2xl font-bold text-gray-900 mb-1'>Các đơn đã ứng tuyển</Text>
      <Text className='text-gray-500 text-sm mb-6'>
        Theo dõi và quản lý dữ liệu lịch sử ứng tuyển ở đây
      </Text>

      {/* Overview Stats from FE */}
      <OverviewCards applications={applications || []} />

      {/* Filters */}
      <Box className='mt-2 mb-4'>
        <Box
          className='bg-white rounded-xl flex-row items-center px-4 py-2 mb-4 border border-gray-200'
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <IconSymbol name='magnifyingglass' size={20} color='#9ca3af' />
          <TextInput
            className='flex-1 ml-3 h-10 text-gray-900'
            placeholder='Tìm kiếm theo tiêu đề...'
            placeholderTextColor='#9ca3af'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Box>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mb-2'>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              activeOpacity={0.7}
              onPress={() => setStatusFilter(s.value)}
              className={`px-4 py-2 rounded-full mr-2 border ${statusFilter === s.value ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
            >
              <Text
                className={`font-semibold text-sm ${statusFilter === s.value ? 'text-white' : 'text-gray-600'}`}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Box>
    </Box>
  )

  return (
    <Box className='flex-1 bg-[#F7F7FD] px-4 pt-6'>
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.tenantApplicationId}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            onDelete={handleDelete}
            onPress={(app) => setSelectedApp(app)}
          />
        )}
        ListEmptyComponent={
          <Box className='items-center justify-center py-16 bg-white rounded-xl mb-12 border border-gray-100'>
            <IconSymbol name='doc.text.fill' size={48} color='#d1d5db' />
            <Text className='mt-4 text-gray-500'>Không có đơn đăng ký nào.</Text>
          </Box>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshing={isLoading || deleteMutation.isPending}
        onRefresh={refetch}
      />

      <ApplicationDetailModal
        application={selectedApp}
        visible={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onDelete={handleDelete}
      />
    </Box>
  )
}
