/**
 * Application-wide constants
 * Single source of truth for magic numbers and configuration values
 */

/**
 * Toast notification durations (in milliseconds)
 */
export const TOAST_DURATION = {
  DEFAULT: 2000,
  SUCCESS: 2000,
  ERROR: 3000,
  WARNING: 2500,
} as const;

/**
 * Navigation delays (in milliseconds)
 * Used for smooth transitions after user actions
 */
export const NAVIGATION_DELAY = {
  AFTER_LOGIN: 2500,
  AFTER_SIGNUP: 3000,
  AFTER_SUCCESS: 2000,
} as const;

/**
 * Drag and drop configuration
 */
export const DRAG_CONFIG = {
  ACTIVATION_DISTANCE: 5, // Minimum distance (px) to activate drag
  SENSOR_DELAY: 0, // Delay before drag starts (ms)
} as const;

/**
 * API request configuration
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // Request timeout (ms)
  RETRY_ATTEMPTS: 3, // Number of retry attempts for failed requests
  RETRY_DELAY: 1000, // Delay between retries (ms)
} as const;

/**
 * Form validation
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  MAX_BOARD_NAME_LENGTH: 50,
  MAX_TASK_TITLE_LENGTH: 100,
  MAX_TASK_DESCRIPTION_LENGTH: 500,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  DEFAULT_AVATAR_SIZE: 64,
  MODAL_ANIMATION_DURATION: 200,
} as const;
