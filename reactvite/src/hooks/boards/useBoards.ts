import { useState, useEffect, useCallback } from 'react';
import { toastError } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

export interface Board {
  id: string;
  name: string;
  created_at: string;
  owner: { username: string };
}

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await safe_fetch('/api/boards/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to load boards');
      const data: Board[] = await res.json();
      setBoards(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
   if (token) fetchBoards();
  }, []);

  return {
    boards,
    loading,
    error,
    refresh: fetchBoards,
  };
}
