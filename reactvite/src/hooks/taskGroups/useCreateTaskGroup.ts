import { toast } from 'react-toastify';
import { useState } from 'react';
import { TaskGroup } from './useTaskGroups';
import { toastError, toastSuccess } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

export function useCreateTaskGroup(boardId: string | undefined,
                                   onSuccess?: (g: TaskGroup)=>void) {
  const [loading, setLoading] = useState(false);

  const create = async (name: string) => {
    if (!name.trim()) return toastError('Group name cannot be empty');
    try {
      setLoading(true);
      const res = await safe_fetch(`/api/boards/${boardId}/task-groups`, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create group');
      toastSuccess('Group created');
      onSuccess?.(data);
    } catch (e: any) {
      toastError('Failed to create group');
    } finally { setLoading(false); }
  };

  return { create, loading };
}
