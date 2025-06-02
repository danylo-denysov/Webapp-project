import { useCallback, useEffect, useState } from 'react';
import { toastError } from '../../utils/toast';
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

  const token = localStorage.getItem('token');

  const fetchGroups = useCallback(async () => {
    if (!boardId) return;
    try {
      setLoading(true); setError(null);
      const res  = await safe_fetch(`/api/boards/${boardId}/task-groups`, {
        method: 'GET',
      });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to load task groups');
      const data: TaskGroup[] = await res.json();
      data.forEach(g => g.tasks.sort(
        (a, b) => a.order - b.order || +new Date(a.created_at) - +new Date(b.created_at)
      ));
      setGroups(data);
    } catch (err: any) {
      setError(err.message); 
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  return { groups, loading, error, refresh: fetchGroups };
}
