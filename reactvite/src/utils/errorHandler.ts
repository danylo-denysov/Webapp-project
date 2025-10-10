/**
 * Centralized error handling utilities
 * Provides consistent error handling patterns across the application
 */

import { toastError } from './toast';

/**
 * Extracts error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Handles API response errors consistently
 * Extracts error message from response and throws Error
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = 'Request failed';

  try {
    const data = await response.json();

    // Handle different error response formats
    if (typeof data.message === 'string') {
      errorMessage = data.message;
    } else if (Array.isArray(data.message)) {
      errorMessage = data.message[0]; // Take first validation error
    } else if (data.error) {
      errorMessage = data.error;
    }
  } catch {
    // Response is not JSON or can't be parsed
    errorMessage = `Request failed with status ${response.status}`;
  }

  throw new Error(errorMessage);
}

/**
 * Standard error handler for async operations
 * Catches errors, extracts message, and shows toast
 */
export function handleError(error: unknown, fallbackMessage?: string): void {
  const message = getErrorMessage(error);
  toastError(fallbackMessage || message);
}

/**
 * Wrapper for async functions that handles errors with toast
 * Usage: await withErrorHandling(async () => { ... }, 'Failed to save')
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  fallbackMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, fallbackMessage);
    return null;
  }
}

/**
 * Check if error is an AbortError (from cancelled request)
 */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
