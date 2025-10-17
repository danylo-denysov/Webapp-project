import { useEffect } from 'react';
import { safe_fetch } from '../../utils/api';

/**
 * Hook that automatically refreshes the access token to maintain session.
 *
 * Security considerations:
 * - Access token TTL is 15 minutes
 * - Refreshes every 5 minutes to ensure token stays valid
 * - Initial refresh on mount validates existing token
 * - Refresh token has absolute expiry (7 days), providing max session length
 * - This prevents indefinite sessions while keeping active users logged in
 */
export function useTokenRefresh() {
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await safe_fetch('/api/users/refresh', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        // If refresh fails, safe_fetch will redirect to login
        console.error('Token refresh failed:', error);
      }
    };

    // Refresh every 5 minutes (access token expires in 15 minutes)
    // This provides a 10-minute safety buffer
    // Don't refresh immediately on mount to avoid interfering with fresh login
    const REFRESH_INTERVAL = 5 * 60 * 1000;
    const intervalId = setInterval(refreshToken, REFRESH_INTERVAL);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);
}
