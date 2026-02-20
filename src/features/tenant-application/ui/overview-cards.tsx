import React from 'react'
import { ScrollView } from 'react-native'
import { TenantApplication } from '@/entities/tenant-application/model/types'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'

interface OverviewCardsProps {
  applications: TenantApplication[]
}

const isAfter30Days = (dateStr: string) => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return new Date(dateStr) > thirtyDaysAgo
}

export const OverviewCards = ({ applications }: OverviewCardsProps) => {
  const recentApplications = applications.filter(
    (app) => app.createdAt && isAfter30Days(app.createdAt)
  )
  const totalRecent = recentApplications.length

  const submitApplications = recentApplications.filter((app) => app.status !== 'DRAFT')
  const totalSubmitted = submitApplications.length

  const respondedApplications = submitApplications.filter(
    (app) => app.status === 'ACCEPTED' || app.status === 'REJECTED' || app.status === 'CANCELLED'
  )
  const totalResponded = respondedApplications.length

  const responseRate = totalSubmitted > 0 ? Math.round((totalResponded / totalSubmitted) * 100) : 0

  return (
    <Box className='mb-6'>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 4 }}
      >
        {/* Intro Card */}
        <Box
          className='bg-white rounded-xl p-4 mr-3 w-36 shadow-sm border border-gray-100 justify-center h-28'
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <Text className='text-sm font-semibold text-gray-900 mb-1'>Tổng quan</Text>
          <Text className='text-xs text-gray-500'>30 ngày qua</Text>
        </Box>

        {/* Total Applications Card */}
        <Box
          className='bg-white rounded-xl p-4 mr-3 w-40 shadow-sm border border-gray-100 justify-between h-28'
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <Text className='text-sm font-medium text-gray-500 mb-1'>Tổng đơn đăng ký</Text>
          <Text className='text-3xl font-bold text-gray-900'>{totalRecent}</Text>
        </Box>

        {/* Application Fee Card */}
        <Box
          className='bg-white rounded-xl p-4 mr-3 w-48 shadow-sm border border-gray-100 justify-between h-28'
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <Text className='text-sm font-medium text-gray-500 mb-1'>Phí ứng tuyển</Text>
          <Text className='text-2xl font-bold text-gray-900'>
            {(totalSubmitted * 50000).toLocaleString('vi-VN')} ₫
          </Text>
        </Box>

        {/* Response Card */}
        <Box
          className='bg-white rounded-xl p-4 mr-3 w-40 shadow-sm border border-gray-100 justify-between h-28'
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <Text className='text-sm font-medium text-gray-500 mb-1'>Phản hồi</Text>
          <Box className='flex-row items-center gap-2'>
            <Text className='text-3xl font-bold text-gray-900'>{totalResponded}</Text>
            <Box className='bg-green-100 px-1.5 py-0.5 rounded'>
              <Text className='text-xs font-bold text-green-700'>{responseRate}%</Text>
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  )
}
