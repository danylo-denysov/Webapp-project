import { useState } from 'react';
import { toast }    from 'react-toastify';
import { TaskGroup } from './useTaskGroups';
import { toastError } from '../../utils/toast';

export function useRenameTaskGroup(
  boardId: string | undefined, 
  onSuccess?: (updated: TaskGroup) => void,
) {
  const [loading, setLoading] = useState(false);

  const rename = async (id: string, newName: string) => {
    if (!newName.trim()) return toastError('Name cannot be empty');
    try {
      setLoading(true);
      const res = await fetch(`/api/boards/${boardId}/task-groups/${id}`, {
        method : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to rename');
      toast.success('Group renamed');
      onSuccess?.(data);
      return data;
    } catch (e: any) {
      toastError(e.message || 'Failed to rename');
    } finally { setLoading(false); }
  };

  return { rename, loading };
}
