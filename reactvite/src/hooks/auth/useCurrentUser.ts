import { useState, useEffect } from 'react';
import { safe_fetch } from '../../utils/api';

interface CurrentUser {
  id: string;
  username: string;
  email: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const res = await safe_fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include',
          signal: abortController.signal,
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          throw new Error('Failed to fetch current user');
        }
      } catch (err) {
        const error = err as Error;
        if (error.name !== 'AbortError') {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();

    return () => {
      abortController.abort();
    };
  }, []);

  return { user, loading, error };
}