/**
 * Map configuration constants for Google Maps integration
 */

export const MAP_CONFIG = {
  /**
   * Default zoom level delta values
   */
  DEFAULT_LATITUDE_DELTA: 0.01,
  DEFAULT_LONGITUDE_DELTA: 0.01,

  /**
   * Zoom control step sizes
   */
  ZOOM_IN_DELTA: 0.5,
  ZOOM_OUT_DELTA: 2,

  /**
   * Minimum and maximum zoom levels
   */
  MIN_ZOOM_DELTA: 0.001,
  MAX_ZOOM_DELTA: 0.5,
} as const
