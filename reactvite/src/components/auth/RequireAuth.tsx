import React from 'react';

/**
 * RequireAuth component for protecting routes.
 *
 * With httpOnly cookies, we can't check auth status from JavaScript.
 * The authentication is verified server-side on each API request.
 * If the user is not authenticated, the safe_fetch utility will:
 * 1. Attempt to refresh the token
 * 2. Redirect to /login if refresh fails
 *
 * This component simply renders children - actual auth enforcement
 * happens via the API layer and automatic redirects on 401 responses.
 */
export default function RequireAuth({ children }: { children: React.ReactElement }) {
  // Simply render children - auth is enforced server-side
  // If user is not authenticated, API calls will fail and trigger redirect
  return children;
}
