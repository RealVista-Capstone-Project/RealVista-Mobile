import http from '@/shared/lib/http';
import type { User } from '../model/types';

export const userApi = {
  getCurrent: () => http.get<User>('/user/profile'),
  getById: (id: string) => http.get<User>(`/users/${id}`),
  update: (data: Partial<User>) => http.put<User>('/user/profile', data),
} as const;
