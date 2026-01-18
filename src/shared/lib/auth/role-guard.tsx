import { useAuthStore } from '@/entities/user'
import { UserRole } from '@/entities/user/model/types'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { Redirect } from 'expo-router'
import React from 'react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
  redirectPath?: string
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = (
    <Box>
      <Text>Access Denied</Text>
    </Box>
  ),
  redirectPath,
}) => {
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role)) {
    if (redirectPath) {
      return <Redirect href={redirectPath as any} />
    }
    return <>{fallback}</>
  }

  return children
}
