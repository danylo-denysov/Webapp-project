import { useState, useEffect, useCallback, useRef } from 'react';
import { safe_fetch } from '../../utils/api';
import { Board } from '../../types/board';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  const fetchBoards = useCallback(async (signal?: AbortSignal) => {
    if (!hasFetchedRef.current) setLoading(true);
    setError(null);
    try {
      const res = await safe_fetch('/api/boards/user', {
        method: 'GET',
        credentials: 'include',
        signal,
      });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to load boards');
      const data: Board[] = await res.json();
      setBoards(data);
      hasFetchedRef.current = true;
    } catch (err) {
      const error = err as Error;
      // Don't set error state if request was aborted
      if (error.name !== 'AbortError') {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    // Fetch boards with abort signal
    fetchBoards(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchBoards]);

  // Wrapper for refresh that doesn't require signal parameter
  const refresh = useCallback(() => {
    return fetchBoards();
  }, [fetchBoards]);

  return {
    boards,
    loading,
    error,
    refresh,
  };
}
