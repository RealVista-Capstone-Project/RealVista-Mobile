import { useQuery } from '@tanstack/react-query'
import { tenantApplicationQueries } from '@/entities/tenant-application/api/tenant-application.queries'
import { TenantApplication } from '@/entities/tenant-application/model/types'
import { useAuthStore } from '@/entities/user'

export const useMyApplications = () => {
  const { user } = useAuthStore()

  const query = useQuery({
    ...tenantApplicationQueries.myApplications(),
    enabled: true, // Bypass user requirement for mobile testing phase
  })

  return {
    applications: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
