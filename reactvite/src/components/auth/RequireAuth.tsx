import React from 'react';
import { useTokenRefresh } from '../../hooks/auth/useTokenRefresh';

/**
 * RequireAuth component for protecting routes.
 * Authentication is verified server-side on each API request.
 * Token refresh happens automatically in safe_fetch on 401 responses.
 */
export default function RequireAuth({ children }: { children: React.ReactElement }) {
  useTokenRefresh();
  return children;
}
