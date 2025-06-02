import { useState } from 'react';
import { toast }    from 'react-toastify';
import { TaskGroup } from './useTaskGroups';
import { toastError, toastSuccess } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

export function useRenameTaskGroup(
  boardId: string | undefined, 
  onSuccess?: (updated: TaskGroup) => void,
) {
  const [loading, setLoading] = useState(false);

  const rename = async (id: string, newName: string) => {
    if (!newName.trim()) return toastError('Name cannot be empty');
    try {
      setLoading(true);
      const res = await safe_fetch(`/api/boards/${boardId}/task-groups/${id}`, {
        method : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to rename');
      toastSuccess('Group renamed');
      onSuccess?.(data);
      return data;
    } catch (e: any) {
      toastError(e.message || 'Failed to rename');
    } finally { setLoading(false); }
  };

  return { rename, loading };
}
