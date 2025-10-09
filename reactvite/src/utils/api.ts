// 401 response -> automatically refresh token using httpOnly cookies
// refresh returns 401 -> redirect to /login

import { toastError } from "./toast";

/**
 * Secure fetch wrapper that handles authentication via httpOnly cookies.
 * Access tokens are stored in httpOnly cookies and automatically sent with requests.
 * On 401, attempts to refresh the token and retry the original request.
 */
export async function safe_fetch(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  // Send request with credentials (cookies sent automatically)
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
  });

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401) {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';

    // If refresh endpoint itself returns 401, session has expired
    if (url.endsWith('/api/users/refresh')) {
      toastError('Your session has expired. Please log in again.');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    // Attempt to refresh the token
    const refreshRes = await fetch('/api/users/refresh', {
      method: 'POST',
      credentials: 'include', // Sends refresh_token cookie
    });

    if (refreshRes.ok) {
      // New access token set in httpOnly cookie by server
      // Retry original request
      const retryResponse = await fetch(input, {
        ...init,
        credentials: 'include',
      });

      return retryResponse;
    } else {
      // Refresh failed - redirect to login
      toastError('Your session has expired. Please log in again.');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}
