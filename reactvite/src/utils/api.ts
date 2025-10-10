import { toastError } from "./toast";

/**
 * Secure fetch wrapper that handles authentication via httpOnly cookies.
 * Access tokens are stored in httpOnly cookies and automatically sent with requests.
 * On 401, attempts to refresh the token and retry the original request.
 * Refresh returns 401 -> redirect to /login
 */
export async function safe_fetch(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  // Properly merge init options with credentials
  const fetchOptions: RequestInit = {
    ...init,
    credentials: 'include',
  };

  const response = await fetch(input, fetchOptions);

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
      // Retry original request with same options
      const retryOptions: RequestInit = {
        ...init,
        credentials: 'include',
      };
      const retryResponse = await fetch(input, retryOptions);

      return retryResponse;
    } else {
      toastError('Your session has expired. Please log in again.');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}
