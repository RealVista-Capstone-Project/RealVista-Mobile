/**
 * Application-wide configuration constants
 */

export const APP_CONFIG = {
  WEB_URL: process.env.EXPO_PUBLIC_WEB_URL || 'https://real-vista.cookie-candy.id.vn',
  SCHEME: 'com.sep.realvista',
  DEFAULT_LOCALE: 'vi',
} as const
