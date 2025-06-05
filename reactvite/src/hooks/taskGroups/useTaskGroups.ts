import { useCallback, useEffect, useRef, useState } from 'react';
import { safe_fetch } from '../../utils/api';

export interface Task {
  id: string;
  title: string;
  description: string;
  created_at: string;
  order: number;
}

export interface TaskGroup {
  id: string;
  name: string;
  created_at: string;
  order: number;
  tasks: Task[];
}

export function useTaskGroups(boardId: string | undefined) {
  const [groups, setGroups]   = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  const fetchGroups = useCallback(async () => {
    if (!boardId) return;
    try {
      if (!hasFetchedRef.current) setLoading(true);
      setError(null);
      const res  = await safe_fetch(`/api/boards/${boardId}/task-groups`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) throw new Error('Forbidden');
      if (!res.ok) throw new Error('Failed to load task groups');
      const data: TaskGroup[] = await res.json();
      data.forEach(g => g.tasks.sort(
        (a, b) => a.order - b.order || +new Date(a.created_at) - +new Date(b.created_at)
      ));
      setGroups(data);
      hasFetchedRef.current = true; 
    } catch (err: any) {
      setError(err.message); 
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (boardId) {
      void fetchGroups();
    }
  }, [boardId]);

  return { groups, loading, error, refresh: fetchGroups };
}
