import { useAuthStore } from '@/entities/user'
import { UserRole } from '@/entities/user/model/types'
import React from 'react'
import { Text, View } from 'react-native'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = (
    <View>
      <Text>Access Denied</Text>
    </View>
  ),
}) => {
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
