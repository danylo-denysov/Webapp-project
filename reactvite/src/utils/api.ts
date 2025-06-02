// 401 respons -> automatically refresh token
// refresh returns token -> save to localStorage and retry original request

import { toastError } from "./toast";

// refresh returns 401 -> clear token and redirect to /login
export async function safe_fetch(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  const accessToken = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
    if (url.endsWith('/api/users/refresh')) {
      localStorage.removeItem('token');
      toastError('Twoja sesja wygasła. Zaloguj się ponownie.');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const refreshRes = await fetch('/api/users/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      const newAccessToken = data.accessToken as string;
      localStorage.setItem('token', newAccessToken);

      const retryHeaders: Record<string, string> = {
        ...(init.headers as Record<string, string> || {}),
        Authorization: `Bearer ${newAccessToken}`,
      };
      const retryResponse = await fetch(input, {
        ...init,
        headers: retryHeaders,
        credentials: 'include',
      });

      return retryResponse;
    } else {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}
