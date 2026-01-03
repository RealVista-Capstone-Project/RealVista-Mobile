/**
 * Application-wide constants
 */

export const APP_NAME = 'Your App Name';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PROFILE: '/profile',
} as const;
