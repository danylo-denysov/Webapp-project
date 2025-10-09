import { useState } from 'react';
import { toastError, toastSuccess } from '../../utils/toast';
import { safe_fetch } from '../../utils/api';

export function useDeleteTaskGroup(boardId: string, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const remove = async (id: string) => {
    try {
      setLoading(true);
      const res = await safe_fetch(`/api/boards/${boardId}/task-groups/${id}`, {
        method : 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete group');
      toastSuccess('Group deleted');
      onSuccess?.();
    } catch (err) {
      const error = err as Error;
      toastError(error.message || 'Failed to delete group');
    } finally { setLoading(false); }
  };

  return { remove, loading };
}
