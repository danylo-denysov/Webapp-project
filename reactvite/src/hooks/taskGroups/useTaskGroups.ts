import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
      const res  = await fetch(`/api/boards/${boardId}/task-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok)           throw new Error('Failed to load task groups');
      setGroups(await res.json());
    } catch (err: any) {
      setError(err.message); toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [boardId, token]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  return { groups, loading, error, refresh: fetchGroups };
}
