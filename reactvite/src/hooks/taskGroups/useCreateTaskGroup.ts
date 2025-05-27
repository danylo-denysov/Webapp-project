import { toast } from 'react-toastify';
import { useState } from 'react';
import { TaskGroup } from './useTaskGroups';

export function useCreateTaskGroup(boardId: string | undefined,
                                   onSuccess?: (g: TaskGroup)=>void) {
  const [loading, setLoading] = useState(false);

  const create = async (name: string) => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    try {
      setLoading(true);
      const res = await fetch(`/api/boards/${boardId}/task-groups`, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create group');
      toast.success('Group created');
      onSuccess?.(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  return { create, loading };
}
