import http from '@/shared/lib/http'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../model/types'

export const userApi = {
  getCurrent: () => http.get<User>('/user/profile'),
  getById: (id: string) => http.get<User>(`/users/${id}`),
  update: (data: Partial<User>) => http.put<User>('/user/profile', data),
  login: (data: LoginPayload) => http.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterPayload) => http.post<User>('/auth/register', data),
  loginGoogle: (data: { idToken: string; platform: 'android' | 'ios' }) =>
    http.post<AuthResponse>('/auth/login-google-mobile', data),
} as const
