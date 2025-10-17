import { useState, useEffect } from 'react';
import { safe_fetch } from '../../utils/api';
import { User } from '../../types/boardUser';

export function useSearchUsers(searchQuery: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await safe_fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          credentials: 'include',
          signal: abortController.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to search users');
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        const error = err as Error;
        if (error.name !== 'AbortError') {
          setError(error.message);
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [searchQuery]);

  return { users, loading, error };
}
