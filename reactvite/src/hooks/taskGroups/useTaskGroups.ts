import { useCallback, useEffect, useRef, useState } from 'react';
import { safe_fetch } from '../../utils/api';
import { Task, TaskGroup } from '../../types/task';

export function useTaskGroups(boardId: string | undefined) {
  const [groups, setGroups]   = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  const fetchGroups = useCallback(async (signal?: AbortSignal) => {
    if (!boardId) return;
    try {
      if (!hasFetchedRef.current) setLoading(true);
      setError(null);
      const res  = await safe_fetch(`/api/boards/${boardId}/task-groups`, {
        method: 'GET',
        credentials: 'include',
        signal,
      });
      if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
      if (!res.ok) throw new Error('Failed to load task groups');
      const data: TaskGroup[] = await res.json();
      data.forEach(g => g.tasks.sort(
        (a, b) => a.order - b.order || +new Date(a.created_at) - +new Date(b.created_at)
      ));
      setGroups(data);
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
  }, [boardId]);

  useEffect(() => {
    if (!boardId) return;

    const abortController = new AbortController();

    // Fetch task groups with abort signal
    fetchGroups(abortController.signal);

    // Cleanup: abort request if component unmounts or boardId changes
    return () => {
      abortController.abort();
    };
  }, [boardId, fetchGroups]);

  // Wrapper for refresh that doesn't require signal parameter
  const refresh = useCallback(() => {
    return fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, error, refresh };
}
