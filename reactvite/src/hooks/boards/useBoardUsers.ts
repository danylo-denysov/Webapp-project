import { useState, useEffect } from 'react';
import { safe_fetch } from '../../utils/api';
import { BoardUser } from '../../types/boardUser';

export function useBoardUsers(boardId: string | undefined) {
  const [users, setUsers] = useState<BoardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await safe_fetch(`/api/boards/${boardId}/users`, {
          method: 'GET',
          credentials: 'include',
          signal: abortController.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to load board users');
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        const error = err as Error;
        if (error.name !== 'AbortError') {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      abortController.abort();
    };
  }, [boardId]);

  const refresh = () => {
    if (!boardId) return;

    const fetchUsers = async () => {
      try {
        const res = await safe_fetch(`/api/boards/${boardId}/users`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to load board users');
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      }
    };

    fetchUsers();
  };

  return { users, loading, error, refresh };
}
